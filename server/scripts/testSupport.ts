// Using global fetch (Node 18+)

// If node-fetch is not available (Node 18+ has built-in fetch), we'll try to use global fetch
// But since this is a script, standard require might be safer if using ts-node or similar.
// Actually, let's assume global fetch is available or we use a simple script.

const API_URL = 'http://localhost:5000/api/support';

async function testSupportFlow() {
    console.log('🧪 Testing AI Support System...');

    try {
        // 1. Start Conversation
        console.log('\n1️⃣ Starting Conversation...');
        const startRes = await fetch(`${API_URL}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test_session_' + Date.now()
            })
        });

        if (!startRes.ok) throw new Error(`Start failed: ${startRes.statusText}`);
        const conversation = await startRes.json();
        console.log('✅ Conversation started:', conversation.id);

        // 2. Send Message
        console.log('\n2️⃣ Sending Message: "How much does it cost?"...');
        const chatRes = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: conversation.id,
                message: 'How much does it cost?'
            })
        });

        if (!chatRes.ok) throw new Error(`Chat failed: ${await chatRes.text()}`);
        const chatData = await chatRes.json();
        console.log('✅ AI Response:', chatData.content);
        console.log('✨ Provider:', chatData.provider);
        console.log('🆔 Message ID:', chatData.messageId);

        // 3. Submit Feedback
        if (chatData.messageId) {
            console.log('\n3️⃣ Submitting Positive Feedback...');
            const feedbackRes = await fetch(`${API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageId: chatData.messageId,
                    rating: 5,
                    comment: 'Great answer!'
                })
            });

            if (!feedbackRes.ok) throw new Error(`Feedback failed: ${feedbackRes.statusText}`);
            console.log('✅ Feedback submitted successfully');
        }

        // 4. Get Stats
        console.log('\n4️⃣ Fetching Stats...');
        const statsRes = await fetch(`${API_URL}/stats`);
        const stats = await statsRes.json();
        console.log('✅ System Stats:', stats);

        console.log('\n🎉 Test Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
}

// Check if fetch is available (Node 18+)
if (!globalThis.fetch) {
    console.error('❌ This script requires Node.js 18+ or a fetch polyfill.');
} else {
    testSupportFlow();
}
