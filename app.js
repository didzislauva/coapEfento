const protobuf = require('protobufjs');
const coap = require('coap');

// Load your .proto files
protobuf.load(['proto_device_info.proto', 'proto_measurements.proto', 'proto_measurement_types.proto', 'proto_cloud_token_config.proto','proto_config.proto','proto_rule.proto'], (err, root) => {
    if (err) throw err;

    // Lookup the main message type
    const ProtoMeasurements = root.lookupType('ProtoMeasurements');  // Replace with the exact message name if it differs

    const server = coap.createServer((req, res) => {
    console.log('Raw payload length:', req.payload.length);
    console.log('Raw payload (hex):', req.payload.toString('hex')); // Log raw payload in hex format

    try {
        const message = ProtoMeasurements.decode(req.payload);
        console.log('Decoded message:', message);
		message.channels.forEach((channel, index) => {
			console.log(`Channel ${index + 1}:`);
			console.log('  Type:', channel.type);  // Likely represents binary open/close events
			console.log('  Timestamp:', channel.timestamp);
			console.log('  Start Point:', channel.start_point || 'N/A');

			// Interpret sampleOffsets based on positive or negative values
			channel.sampleOffsets.forEach((offset, i) => {
				const state = offset > 0 ? 'Open/On' : 'Closed/Off';
				const eventTime = channel.timestamp + Math.abs(offset) - 1;
				console.log(`  Event ${i + 1}: ${state} at timestamp ${eventTime}`);
			});
		});

        res.code = '2.01';
        res.end('Data received');
    } catch (error) {
        console.error('Failed to decode message:', error);
        res.end('Decode error');
    }
});

    server.listen(5683, () => {
        console.log('CoAP server is running on port 5683');
    });
});
