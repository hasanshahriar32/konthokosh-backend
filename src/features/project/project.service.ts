import { eq, and, or, sql } from 'drizzle-orm';
import db from '../../db/db';
import { getPaginatedData, getPagination } from '../../utils/common';
import { ListQuery } from '../../types/types';
import { projects } from '../../db/schema/project';
import { THINKSOURCE_API_TOKEN } from '../../configs/envConfig';
import axios from 'axios';

// Helper: filter projects by keyword (title, description, or searchId)
function buildProjectKeywordFilter(keyword: string) {
  if (!keyword) return undefined;
  return or(
    sql`LOWER(${projects.title}) LIKE LOWER('%' || ${keyword} || '%')`,
    sql`LOWER(${projects.description}) LIKE LOWER('%' || ${keyword} || '%')`,
    sql`LOWER(${projects.searchId}) LIKE LOWER('%' || ${keyword} || '%')`
  );
}

// Call external ThinkSource API to search for papers
async function searchThinkSourceAPI(query: string) {
  if (!THINKSOURCE_API_TOKEN) {
    throw new Error('THINKSOURCE_API_TOKEN is not configured');
  }

  const requestBody = {
    query: query,
    filters: {
      fileType: 'pdf',
      maxSize: 0,
      maxPages: 0,
      yearFrom: 0,
      yearTo: 0,
      language: 'string',
      limit: 5
    },
    sources: [
      'openalex',
      'arxiv',
      'pubmed'
    ]
  };

  try {
    const response = await axios.post(
      'https://thinksource.onrender.com/api/search',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${THINKSOURCE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('ThinkSource API error:', error);
    throw new Error('Failed to fetch research papers from ThinkSource API');
  }
}

export async function getProjects(filters: ListQuery, userId?: number) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  
  // Build where clause with keyword filter and optional userId filter
  const keywordFilter = buildProjectKeywordFilter(filters.keyword || '');
  const userFilter = userId ? eq(projects.userId, userId) : undefined;
  
  const whereClause = keywordFilter && userFilter 
    ? and(keywordFilter, userFilter)
    : keywordFilter || userFilter;
  
  const dataQuery = db
    .select()
    .from(projects)
    .where(whereClause)
    .limit(pagination.limit)
    .offset(pagination.offset);
    
  const countQuery = db
    .select({ count: sql`count(*)` })
    .from(projects)
    .where(whereClause);
    
  return getPaginatedData(dataQuery, countQuery, filters, pagination);
}

export async function getProject(id: string | number, userId?: number) {
  const whereClause = userId 
    ? and(eq(projects.id, Number(id)), eq(projects.userId, userId))
    : eq(projects.id, Number(id));
    
  const project = await db
    .select()
    .from(projects)
    .where(whereClause);
  return project[0] || null;
}

export async function createProject(data: { title: string; description: string; userId: number }) {
  // Create search query by combining title and description
  const searchQuery = `${data.title} ${data.description}`.trim();
  
  // Call external ThinkSource API
  const apiResponse = await searchThinkSourceAPI(searchQuery);
  
  // Extract searchId from the search object
  const searchId = apiResponse.search?.id?.toString() || '';
  
  // Map papers array to our pdfList format
  const pdfList = apiResponse.papers?.map((paper: any) => ({
    id: paper.id,
    searchId: paper.searchId,
    title: paper.title,
    authors: paper.authors || [],
    abstract: paper.abstract,
    year: paper.year,
    source: paper.source,
    sourceId: paper.sourceId,
    url: paper.url,
    pdfUrl: paper.pdfUrl,
    doi: paper.doi,
    citations: paper.citations,
    fileSize: paper.fileSize,
    pageCount: paper.pageCount,
    language: paper.language,
    tags: paper.tags || [],
    matchScore: paper.matchScore,
    metadata: paper.metadata || {},
    selected: paper.selected || false,
    createdAt: paper.createdAt
  })) || [];

  // Create project with API data
  const [created] = await db.insert(projects).values({
    userId: data.userId,
    title: data.title,
    description: data.description,
    searchId: searchId,
    pdfList: pdfList,
  }).returning();
  
  return created;
}

export async function updateProject({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof projects.$inferInsert>;
}) {
  const [updated] = await db
    .update(projects)
    .set(data)
    .where(eq(projects.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteProject(id: string | number) {
  const [deleted] = await db
    .delete(projects)
    .where(eq(projects.id, Number(id)))
    .returning();
  return deleted;
}

export async function projectExists(id: string | number): Promise<boolean> {
  const project = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, Number(id)));
  return project.length > 0;
}
