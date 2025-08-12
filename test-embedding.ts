import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testCloudflareEmbedding() {
  console.log("🧪 Testing Cloudflare Workers AI Embedding...\n");

  // Check environment variables
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  console.log("🔍 Environment Check:");
  console.log(`API Key present: ${!!apiKey}`);
  console.log(`API Key length: ${apiKey?.length || 0}`);
  console.log(`Account ID present: ${!!accountId}`);
  console.log(`Account ID: ${accountId?.substring(0, 8)}...`);
  console.log();

  if (!apiKey || !accountId) {
    console.error("❌ Missing required environment variables!");
    console.log("Please ensure CLOUDFLARE_API_KEY and CLOUDFLARE_ACCOUNT_ID are set in your .env file");
    return;
  }

  // Create OpenAI client for Cloudflare
  const baseURL = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`;
  console.log(`🌐 Base URL: ${baseURL}\n`);

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  // Test different models and inputs
  const testCases = [
    {
      model: "@cf/baai/bge-m3",
      input: "This is a simple test sentence",
      description: "BGE-M3 model with simple text"
    },
    {
      model: "@cf/baai/bge-m3",
      input: "Hello world! How are you today? This is a longer sentence with more content to embed.",
      description: "BGE-M3 model with longer text"
    },
    {
      model: "@cf/baai/bge-large-en-v1.5",
      input: "This is a simple test sentence",
      description: "BGE-Large model with simple text"
    },
    {
      model: "@cf/baai/bge-base-en-v1.5",
      input: "This is a simple test sentence",
      description: "BGE-Base model with simple text"
    },
    {
      model: "@cf/baai/bge-small-en-v1.5",
      input: "This is a simple test sentence",
      description: "BGE-Small model with simple text"
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔬 Testing: ${testCase.description}`);
    console.log(`📝 Input: "${testCase.input}"`);
    console.log(`🤖 Model: ${testCase.model}`);
    
    try {
      const startTime = Date.now();
      
      const response = await openai.embeddings.create({
        model: testCase.model,
        input: testCase.input,
      });

      const duration = Date.now() - startTime;
      
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Response object type: ${response.object}`);
      console.log(`📊 Data array length: ${response.data.length}`);
      
      if (response.data.length > 0) {
        const embedding = response.data[0].embedding;
        console.log(`🔢 Embedding dimensions: ${embedding.length}`);
        console.log(`🔢 First 10 values: [${embedding.slice(0, 10).join(', ')}]`);
        console.log(`🔢 Last 10 values: [${embedding.slice(-10).join(', ')}]`);
        
        // Check if all values are zero
        const allZeros = embedding.every((val: number) => val === 0);
        const nonZeroCount = embedding.filter((val: number) => val !== 0).length;
        
        console.log(`⚡ Non-zero values: ${nonZeroCount}/${embedding.length}`);
        console.log(`${allZeros ? '❌' : '✅'} All zeros: ${allZeros}`);
        
        // Calculate some basic stats
        const sum = embedding.reduce((a: number, b: number) => a + b, 0);
        const mean = sum / embedding.length;
        const variance = embedding.reduce((acc: number, val: number) => acc + Math.pow(val - mean, 2), 0) / embedding.length;
        const stdDev = Math.sqrt(variance);
        
        console.log(`📈 Statistics:`);
        console.log(`   Sum: ${sum.toFixed(6)}`);
        console.log(`   Mean: ${mean.toFixed(6)}`);
        console.log(`   Std Dev: ${stdDev.toFixed(6)}`);
        
        if (!allZeros) {
          console.log(`✅ SUCCESS: Got valid embedding!`);
        }
      }
      
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}`);
      
      if (error.response) {
        console.log(`📡 Response Status: ${error.response.status}`);
        console.log(`📡 Response Data:`, error.response.data);
      }
      
      if (error.cause) {
        console.log(`🔍 Cause:`, error.cause);
      }
    }
    
    console.log("─".repeat(80));
  }

  // Test with array input
  console.log(`\n🔬 Testing: Array input`);
  try {
    const response = await openai.embeddings.create({
      model: "@cf/baai/bge-m3",
      input: ["First sentence", "Second sentence", "Third sentence"],
    });
    
    console.log(`📊 Response data length: ${response.data.length}`);
    response.data.forEach((item, index) => {
      console.log(`📊 Item ${index}: dimensions=${item.embedding.length}, non-zero=${item.embedding.filter((v: number) => v !== 0).length}`);
    });
    
  } catch (error: any) {
    console.log(`❌ Array input error: ${error.message}`);
  }
}

// Run the test
testCloudflareEmbedding()
  .then(() => {
    console.log("\n🏁 Test completed!");
  })
  .catch((error) => {
    console.error("\n💥 Test failed:", error);
  });
