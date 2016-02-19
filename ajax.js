$AJAX = function (obj) {
    var i,
        res,
        url,
        xhr,
        status,
        statusText,
        callback,
        responses = {},
        availableType       = ['GET', 'POST', 'PUT'],
        availableDataType   = ['json', 'text'],
        headers             = {},
        xmlhttpobj          = XMLHttpRequest,
        Msxml2              = 'Msxml2.XMLHTTP',
        args = {
            url:            obj.url             || false,
            async:          obj.async           || false,
            data:           obj.data            || null,
            crossDomain:    obj.crossDomain     || false,
            complete:       obj.result          || function(){},
            timeout:        obj.timeout         || 10000,
            type:           ( availableType.indexOf(obj.type) !== -1 ? obj.type : null )                || "GET",
            dataType:       ( availableDataType.indexOf(obj.dataType) !== -1 ? obj.dataType : null )    || "json"
        };

    if (typeof args.url === und || args.url === false) {
        return;
    }

    if (typeof xmlhttpobj == und){
        xmlhttpobj = function () {
            try {
                var activex_obj = ActiveXObject;
            } catch ( e ) {}
            try {
                return new activex_obj( Msxml2+'.6.0' );
            } catch ( e ) {}
            try {
                return new activex_obj( Msxml2+'.3.0' );
            } catch ( e ) {}
            try {
                return new activex_obj( Msxml2 );
            } catch ( e ) {}
            throw new Error( 'This browser does not support XMLHttpRequest.' );
        };
    }
    xhr = new (("onload" in new xmlhttpobj()) ? xmlhttpobj : XDomainRequest)();

    url = args.url;
    if (args.type === 'GET' && args.data && args.data.length>0) {
        url = args.url + '?' +args.data.toString();
    }
    xhr.open( args.type, url, args.async );

    if ( !args.crossDomain ) {
        headers["X-Requested-With"] = "XMLHttpRequest";
    }

    for ( i in headers ) { // Support: IE<9
        if ( headers.hasOwnProperty(i) && typeof headers[ i ] !== 'undefined' ) {
            xhr.setRequestHeader( i, headers[ i ] + "" );
        }
    }

    if (args.data && args.data.toString().length>0) {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        args.data = args.data.toString();
    }

    try {
        xhr.send(args.data || null);
    } catch ( e ) {}

    if  (args.async) {
        var timeout = setTimeout( function() {
            xhr.abort();
        }, args.timeout);
    }

    callback = function() {
        if ( xhr.readyState === 4  ) {
            if  (args.async) {
                clearTimeout(timeout);
            }
            callback = 'undefined';
            if ( xhr.readyState !== 4 ) {
                xhr.abort();
            } else {
                status = xhr.status;
                if ( typeof xhr.responseText === "string" ) {responses.text = xhr.responseText;}
                try {statusText = xhr.statusText;} catch( e ) {statusText = "";}
                if ( !status && !args.crossDomain ) {
                    status = responses.text ? 200 : 404;
                } else if ( status === 1223 ) {
                    status = 204;
                }
            }
        }

        if ( responses ) {
            if ( !status && !args.crossDomain ) {
                status = responses.text ? 200 : 404;
            } else if ( status === 1223 ) {
                status = 204;
            }
            if (status === 200) {
                if(args.dataType === 'text') {
                    res = responses.text || '';
                } else if (args.dataType === 'json') {
                    res = JSON.parse(responses.text) || '';
                }
                /**
                 * @param a responce result
                 * @param b responce code
                 * @param c response text
                 * @param d header for responce
                 */
                args.complete(res, status, statusText, xhr.getAllResponseHeaders());
            }
        }
    };

    if ( !args.async ) {
        callback();
    } else if ( xhr.readyState === 4 ) { // (IE6 & IE7) if it's in cache and has been
        setTimeout( callback );
    } else {
        xhr.onreadystatechange = callback;
    }
};
