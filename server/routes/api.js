
app_api.get('/', (req, res) => {
	console.log(req);
	res.send({
		test: 'test'
	});		
});

app_api.get('/api', (req, res) => {
	console.log(req);
	res.send({
		test: 'test'
	});		
});



