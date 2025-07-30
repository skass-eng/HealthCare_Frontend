const https = require('https');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testAPI() {
  try {
    console.log('Testing backend API...');
    
    // Test health check
    const healthResult = await makeRequest('http://localhost:5000/api/v1/health');
    console.log('Health check status:', healthResult.status);
    
    // Test plaintes endpoint
    const plaintesResult = await makeRequest('http://localhost:5000/api/v1/plaintes');
    console.log('Plaintes endpoint status:', plaintesResult.status);
    
    if (plaintesResult.status === 200 && plaintesResult.data.plaintes) {
      console.log('Plaintes found:', plaintesResult.data.plaintes.length);
      
      if (plaintesResult.data.plaintes.length > 0) {
        const firstPlainte = plaintesResult.data.plaintes[0];
        console.log('First plainte ID:', firstPlainte.plainte_id);
        
        // Test getting specific plainte
        const plainteResult = await makeRequest(`http://localhost:5000/api/v1/plaintes/${firstPlainte.plainte_id}`);
        console.log('Specific plainte status:', plainteResult.status);
        
        if (plainteResult.status === 200) {
          console.log('Plainte details found!');
        } else {
          console.log('Error getting specific plainte:', plainteResult.data);
        }
      }
    } else {
      console.log('Error getting plaintes:', plaintesResult.data);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI(); 