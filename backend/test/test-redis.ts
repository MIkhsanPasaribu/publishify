import { createClient } from 'redis';
import 'dotenv/config';

async function testRedis() {
  console.log('\n🔍 Testing Redis Connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.REDIS_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.REDIS_PORT || '6379'}`);
  console.log(`  Username: ${process.env.REDIS_USERNAME || '(none)'}`);
  console.log(`  Password: ${process.env.REDIS_PASSWORD ? '***' : '(empty)'}`);
  console.log(`  Database: ${process.env.REDIS_DB || '0'}\n`);

  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DB || '0'),
  });

  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
  });

  try {
    // Connect
    console.log('Connecting to Redis...');
    await client.connect();
    console.log('✅ Redis connected successfully!\n');

    // Test PING
    const pong = await client.ping();
    console.log(`✅ PING: ${pong}`);

    // Test SET
    await client.set('test-key', 'Hello from Publishify Backend!');
    console.log('✅ SET test-key = "Hello from Publishify Backend!"');

    // Test GET
    const value = await client.get('test-key');
    console.log(`✅ GET test-key = "${value}"`);

    // Test SETEX (with TTL)
    await client.setEx('ttl-key', 60, 'Expires in 60 seconds');
    const ttl = await client.ttl('ttl-key');
    console.log(`✅ SETEX ttl-key with TTL = ${ttl} seconds`);

    // Test INCR
    await client.set('counter', '0');
    const counter = await client.incr('counter');
    console.log(`✅ INCR counter = ${counter}`);

    // Test HSET/HGET (Hash)
    await client.hSet('user:1', { name: 'Ahmad Surya', role: 'penulis' });
    const userName = await client.hGet('user:1', 'name');
    console.log(`✅ HGET user:1 name = "${userName}"`);

    // Test keys count
    const keysCount = await client.dbSize();
    console.log(`✅ Total keys in DB: ${keysCount}`);

    // Clean up test keys
    await client.del(['test-key', 'ttl-key', 'counter', 'user:1']);
    console.log('✅ Cleanup: Test keys deleted\n');

    console.log('🎉 All Redis tests passed!');
    console.log('\n📊 Redis is ready for caching in Publishify Backend!\n');

    // Server info
    const info = await client.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    console.log(`Redis Version: ${version}`);
  } catch (error) {
    console.error('\n❌ Redis connection failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check if Redis is running:');
    console.error('     - Docker: docker ps');
    console.error('     - WSL: sudo service redis-server status');
    console.error('  2. Verify .env configuration');
    console.error('  3. Check firewall/network settings');
    console.error('  4. For cloud Redis, verify credentials\n');
    process.exit(1);
  } finally {
    await client.disconnect();
  }
}

// Run test
testRedis().catch(console.error);
