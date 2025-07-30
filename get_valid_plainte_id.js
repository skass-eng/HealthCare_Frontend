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

async function getValidPlainteId() {
  try {
    console.log('Getting plaintes from backend...');
    
    const result = await makeRequest('http://localhost:5000/api/v1/plaintes');
    
    if (result.status === 200 && result.data.plaintes) {
      console.log('Plaintes found:', result.data.plaintes.length);
      
      if (result.data.plaintes.length > 0) {
        console.log('\nFirst 5 plaintes with their IDs:');
        result.data.plaintes.slice(0, 5).forEach((plainte, index) => {
          console.log(`${index + 1}. ID: ${plainte.plainte_id}, Titre: ${plainte.titre}`);
        });
        
        // Test with first plainte ID
        const firstPlainte = result.data.plaintes[0];
        if (firstPlainte.plainte_id) {
          console.log(`\nTesting with plainte ID: ${firstPlainte.plainte_id}`);
          
          const plainteResult = await makeRequest(`http://localhost:5000/api/v1/plaintes/${firstPlainte.plainte_id}`);
          console.log('Specific plainte status:', plainteResult.status);
          
          if (plainteResult.status === 200) {
            console.log('✅ Plainte found successfully!');
            console.log('Titre:', plainteResult.data.titre);
            console.log('Service:', plainteResult.data.service);
            console.log('\n🎯 VALID PLAINTE ID FOR TESTING:', firstPlainte.plainte_id);
          } else {
            console.log('❌ Error getting specific plainte:', plainteResult.data);
          }
        } else {
          console.log('❌ No valid plainte_id found in the response');
          console.log('This suggests the backend data needs to be refreshed');
        }
      }
    } else {
      console.log('Error getting plaintes:', result.data);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getValidPlainteId(); 