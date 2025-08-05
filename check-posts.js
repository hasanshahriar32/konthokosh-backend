import db from './src/db/db.js';
import { posts } from './src/db/schema/posts.js';
import { users } from './src/db/schema/users.js';
import { eq } from 'drizzle-orm';

async function checkData() {
  try {
    console.log('=== Checking Posts ===');
    const allPosts = await db.select().from(posts);
    console.log('Total posts in DB:', allPosts.length);
    console.log('Posts data:', JSON.stringify(allPosts, null, 2));

    console.log('\n=== Checking Users ===');
    const allUsers = await db.select().from(users);
    console.log('Total users in DB:', allUsers.length);
    console.log('Users data:', JSON.stringify(allUsers, null, 2));

    console.log('\n=== Testing JOIN ===');
    const joinResult = await db
      .select({
        postId: posts.id,
        postContent: posts.post,
        userId: posts.userId,
        isApproved: posts.isApproved,
        isActive: posts.isActive,
        isDeleted: posts.isDeleted,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id));
    
    console.log('JOIN result:', JSON.stringify(joinResult, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkData();
