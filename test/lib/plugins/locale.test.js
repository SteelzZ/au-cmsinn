if(Meteor.isServer){
    // Meteor.methods({
    //     'locale-plugin-test/cleanup' : function(){
    //         ContentCollection.remove({});
    //         ContentCollection.insert({
    //             _id: 'locale',
    //             contentType: 'locale',
    //             locale : 'en_US'
    //         });
    //     }
    // });
}

if(Meteor.isClient){
    // Clean up before test in case test fails 
    // testAsyncMulti('Locale - Test if on client operations on currency service only allowed for logged in users', [
    //     function (test, expect) {
    //         Meteor.call('locale-plugin-test/cleanup');
    //     },
    //     function(test, expect){
    //         var locale = CmsInnLocale.get('locale');
            
    //         var currencyService = new CurrencyService();
    //         currencyService.add("EUR", "Euro", true, expect(function(err, doc){
    //             test.instanceOf(err, Meteor.Error);
    //             test.equal(err.error, 403);
    //         }));
    //     },
    //     function (test, expect) {
    //         Meteor.call('currency-service-test/cleanup');
    //     },
    //     function (test, expect) {
    //         var username = Random.id();
    //         var password = 'password';

    //         Accounts.callLoginMethod({
    //             methodName: 'createUser',
    //             methodArguments: [{username: username, password: password}]
    //         });
    //     },
    //     function(test, expect){
    //         var currencyService = new CurrencyService();
    //         var id = currencyService.add("LTL", "Litas", true);
    //         test.equal("LTL", id);
    //     },
    //     function (test, expect) {
    //         Meteor.call('currency-service-test/cleanup');
    //     }
    // ]);
}