
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('Starting Pastebin Lite Tests...');
  
  // 1. Health Check
  console.log('\n[TEST 1] Health Check...');
  const healthRes = await fetch(`${BASE_URL}/api/healthz`);
  if (healthRes.status === 200) {
    console.log('✅ Health Check Passed');
  } else {
    console.error('❌ Health Check Failed', healthRes.status, await healthRes.text());
    process.exit(1);
  }

  // 2. Create Paste (Simple)
  console.log('\n[TEST 2] Create Simple Paste...');
  const createRes = await fetch(`${BASE_URL}/api/pastes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Hello World' })
  });
  const createData = await createRes.json();
  if (createRes.ok && createData.id) {
    console.log('✅ Created Paste:', createData.id);
  } else {
    console.error('❌ Create Failed', createData);
    process.exit(1);
  }

  // 3. Fetch Paste
  console.log('\n[TEST 3] Fetch Paste...');
  const fetchRes = await fetch(`${BASE_URL}/api/pastes/${createData.id}`);
  const fetchData = await fetchRes.json();
  if (fetchRes.ok && fetchData.content === 'Hello World') {
    console.log('✅ Fetched Content Matches');
  } else {
    console.error('❌ Fetch Failed', fetchData);
    process.exit(1);
  }

  // 4. Test Max Views (Create with max_views=2)
  console.log('\n[TEST 4] Max Views Limit...');
  const viewRes = await fetch(`${BASE_URL}/api/pastes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Limited View', max_views: 2 })
  });
  const viewData = await viewRes.json();
  console.log('  Created ID:', viewData.id);

  // View 1
  const v1 = await fetch(`${BASE_URL}/api/pastes/${viewData.id}`);
  console.log('  View 1 status:', v1.status, '(Expected 200)');
  
  // View 2
  const v2 = await fetch(`${BASE_URL}/api/pastes/${viewData.id}`);
  console.log('  View 2 status:', v2.status, '(Expected 200)');

  // View 3 (Should fail)
  const v3 = await fetch(`${BASE_URL}/api/pastes/${viewData.id}`);
  console.log('  View 3 status:', v3.status, '(Expected 404)');
  
  if (v1.ok && v2.ok && v3.status === 404) {
    console.log('✅ Max Views Logic Correct');
  } else {
    console.error('❌ Max Views Logic Failed');
    process.exit(1);
  }

  // 5. Test TTL with Time Travel
  console.log('\n[TEST 5] TTL & Time Travel...');
  // Create paste with TTL = 60 seconds
  const ttlRes = await fetch(`${BASE_URL}/api/pastes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Expire Me', ttl_seconds: 60 })
  });
  const ttlData = await ttlRes.json();
  console.log('  Created ID:', ttlData.id);

  // Verify it exists now
  const t1 = await fetch(`${BASE_URL}/api/pastes/${ttlData.id}`);
  if (!t1.ok) {
     console.error('❌ Immediate fetch failed');
     process.exit(1);
  }

  // Time travel: +61 seconds
  const futureTime = Date.now() + 61000;
  console.log('  Time travelling to:', new Date(futureTime).toISOString());
  
  const t2 = await fetch(`${BASE_URL}/api/pastes/${ttlData.id}`, {
    headers: { 'x-test-now-ms': futureTime.toString() }
  });
  console.log('  Future fetch status:', t2.status, '(Expected 404)');

  if (t2.status === 404) {
    console.log('✅ TTL Expiry Logic Correct');
  } else {
    console.error('❌ TTL Expiry Logic Failed');
    process.exit(1);
  }

  console.log('\n✅ ALL TESTS PASSED');
}

runTests().catch(e => console.error(e));
