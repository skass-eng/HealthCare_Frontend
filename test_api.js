const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing backend API...');
    
    // Test health check
    const healthResponse = await fetch('http://localhost:5000/api/v1/health');
    console.log('Health check status:', healthResponse.status);
    
    // Test plaintes endpoint
    const plaintesResponse = await fetch('http://localhost:5000/api/v1/plaintes');
    console.log('Plaintes endpoint status:', plaintesResponse.status);
    
    if (plaintesResponse.ok) {
      const plaintes = await plaintesResponse.json();
      console.log('Plaintes found:', plaintes.plaintes?.length || 0);
      
      if (plaintes.plaintes && plaintes.plaintes.length > 0) {
        const firstPlainte = plaintes.plaintes[0];
        console.log('First plainte ID:', firstPlainte.plainte_id);
        
        // Test getting specific plainte
        const plainteResponse = await fetch(`http://localhost:5000/api/v1/plaintes/${firstPlainte.plainte_id}`);
        console.log('Specific plainte status:', plainteResponse.status);
        
        if (plainteResponse.ok) {
          const plainte = await plainteResponse.json();
          console.log('Plainte details:', plainte);
        } else {
          console.log('Error getting specific plainte:', await plainteResponse.text());
        }
      }
    } else {
      console.log('Error getting plaintes:', await plaintesResponse.text());
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI(); 