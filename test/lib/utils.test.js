Tinytest.add('Utils - parseAttr', function (test) {
    var res = Utilities.parseAttr('asdrfreADDSF[field_nJA]');
    test.equal(res['recordId'], 'asdrfreADDSF');
    test.equal(res['fieldId'], 'field_nJA');
    test.equal(res['id'], 'asdrfreADDSF[field_nJA]');

    res = Utilities.parseAttr('asdrfreADDSF[field_nJA]s');
    test.equal(res['id'], 'asdrfreADDSFfield_nJAs');

    res = Utilities.parseAttr('[field_nJA]');
    test.equal(res['id'], 'field_nJA');

    res = Utilities.parseAttr('field_nJA]');
    test.equal(res['id'], 'field_nJA');

    res = Utilities.parseAttr('fiel[d_n]JA');
    test.equal(res['id'], 'field_nJA');

    res = Utilities.parseAttr('fiel[d_n]J1234A');
    test.equal(res['id'], 'field_nJ1234A');

    res = Utilities.parseAttr('213234!@########$)(*(&%$$%fiel[d_n]J12....34A');
    test.equal(res['id'], '213234field_nJ1234A');
});