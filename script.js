const GENERATE_CONTRACTS_WEBHOOK_URL = 'https://hook.integromat.com/s6xj6xv9atv4udsdykgg2oexb6qcip0b';
const RENEW_CONTRACTS_WEBHOOK_URL = 'https://hook.integromat.com/ygvilyye0dmbojqhm4tubksoyo48ijqh';

$(document).ready(function() {
  
  var Airtable = require('airtable');
  var base = new Airtable({apiKey: process.env.API_KEY}).base(process.env.BASE_ID);
   
  $('#generate-contracts').click(function() {
    $(this).attr('disabled', true);
    $.post(GENERATE_CONTRACTS_WEBHOOK_URL, function(data) {
      console.log('Done!');
      //console.log(data);
      $('#generate-contracts').removeAttr('disabled');
    }); 
  });
  
  $('#renew-contracts').click(function() {
    $(this).attr('disabled', true);
    
    console.log('Renewing contracts...');
    
    base('Contracts').select({
      view: "Contract Renewal",
      pageSize: 10
      //maxRecords: 1
    }).eachPage(function page(records, fetchNextPage) {      
      var contractsToAdd = [];
      
      // Loop through 10 records at a time
      records.forEach(function(record) {
        console.log('Retrieved', record.get('Contract'));

        var startDt = record.get('Start Dt');
        console.log('startDt=' + startDt);
        var renewDt = moment(startDt).add(1, 'years').format('YYYY-MM-DD');
        console.log('renewDt=' + renewDt);
        
        // Build array of contracts to be updated
        contractsToAdd.push({
          "fields": {
            "Start Dt": renewDt.toString('YYYY-mm-dd'), // TODO: Add year
            "Price": record.get('Price'),
            "Premium?": record.get('Premium?'),
            "Contract Notes": record.get('Contract Notes'),
            "Equipment": record.get('Equipment')
          }
        });  
      });

      // Reset generate flag for batch of 10
      base('Contracts').create(contractsToAdd, function(err, records) {
        if (err) { console.error(err); return; }
      });

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
    }, function done(err) {
        if (err) { console.error(err); return; }
      
        console.log('Done!');
        $('#renew-contracts').removeAttr('disabled');
    });
  });
  
  $('#reset-contracts').click(function() {    
    $(this).attr('disabled', true);
    
    console.log('Resetting contracts...');

    base('Contracts').select({
      view: "Contract Generation",
      pageSize: 10
    }).eachPage(function page(records, fetchNextPage) {      
      var contractsToUpdate = [];
      
      // Loop through 10 records at a time
      records.forEach(function(record) {
        console.log('Retrieved', record.get('Contract'));

        // Build array of contracts to be updated
        contractsToUpdate.push({
          "id": record.id,
          "fields": {
            "Generate?": true,
            "Cycle": '',
            "Batch": '',
            "Generated": null
          }
        });  
      });

      // Reset generate flag for batch of 10
      base('Contracts').update(contractsToUpdate, function(err, records) {
        if (err) { console.error(err); return; }
      });

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
    }, function done(err) {
        if (err) { console.error(err); return; }
      
        console.log('Done!');
        $('#reset-contracts').removeAttr('disabled');
    });
        
    // Trigger webhook (DEPRECATED)
    /*
    $.post(RESET_CONTRACTS_WEBHOOK_URL, function(data) {
      console.log('Done!');
      //console.log(data);
      $('#reset-contracts').removeAttr('disabled');
    });
    */    
  });
  
});