/*

IMPORTANT:
Ajax requests that update Shopify's cart must be queued and sent synchronously to the server.
Meaning: you must wait for your 1st ajax callback to send your 2nd request, and then wait
for its callback to send your 3rd request, etc.
*/
if ((typeof Shopify) === 'undefined') { Shopify = {}; }

/*
Override so that Shopify.formatMoney returns pretty
money values instead of cents.
*/

Shopify.money_format = '${{amount}}';
Shopify.secure_url;
Shopify.permanent_domain;
Shopify.runPromotions = function(){ };
Shopify.discountCode;
Shopify.promotionConfig = {};
Shopify.getCookie = function(name) {
	return (document.cookie.match('(^|; )'+name+'=([^;]*)')||0 )[2];
};

Shopify.onError = function(type, message) {
  // Shopify returns a description of the error in XMLHttpRequest.responseText.
  // It is JSON.
  // Example: {"description":"The product 'Amelia - Small' is already sold out.","status":500,"message":"Cart Error"}
  var data = message;
  if (message) {
    console.log(type +': '+ data.message);
  } else {
    console.log('Error : ' + Shopify.fullMessagesFromErrors(data).join('; ') + '.');
  }
};

Shopify.fullMessagesFromErrors = function(errors) {
  var fullMessages = [];
  jQuery.each(errors, function(attribute, messages) {
    jQuery.each(messages, function(index, message) {
      fullMessages.push(attribute + ' ' + message);
    });
  });
  return fullMessages
}

Shopify.updateCartElements = function(cart) {

}

Shopify.updateCartElement = function(item) {
}

Shopify.onCartUpdate = function(cart) {

};

Shopify.onCartShippingRatesUpdate = function(rates, shipping_address) {
  var readable_address = '';
  if (shipping_address.zip) readable_address += shipping_address.zip + ', ';
  if (shipping_address.province) readable_address += shipping_address.province + ', ';
  readable_address += shipping_address.country
  //alert('There are ' + rates.length + ' shipping rates available for ' + readable_address +', starting at '+ Shopify.formatMoney(rates[0].price) +'.');
};

Shopify.onItemAdded = function(item) {
};

Shopify.onProduct = function(product) {
 //alert('Received everything we ever wanted to know about ' + product.title);
};

/* Tools */

/*
Examples of call:
Shopify.formatMoney(600000, 'â‚¬{{amount_with_comma_separator}} EUR')
Shopify.formatMoney(600000, 'â‚¬{{amount}} EUR')
Shopify.formatMoney(600000, '${{amount_no_decimals}}')
Shopify.formatMoney(600000, '{{ shop.money_format }}') in a Liquid template!

In a Liquid template, you have access to a shop money formats with:
{{ shop.money_format }}
{{ shop.money_with_currency_format }}
{{ shop.money_without_currency_format }}
All these formats are editable on the Preferences page in your admin.
*/
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

Shopify.resizeImage = function(image, size) {
  try {
    if(size == 'original') { return image; }
    else {
      var matches = image.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
      return matches[1] + '_' + size + '.' + matches[2];
    }
  } catch (e) { return image; }
};

/* Ajax API */

// -------------------------------------------------------------------------------------
// POST to cart/add.js returns the JSON of the line item associated with the added item.
// -------------------------------------------------------------------------------------
Shopify.addItem = function(variant_id, quantity, callback) {
  var quantity = quantity || 1;
  let formData = { 'items': [{ 'id': variant_id, 'quantity': quantity }] };
  let item = false;

  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    data['items'].forEach((item) => { Shopify.onItemAdded(item); });   
    if ((typeof callback) === 'function') {
      callback(item);
    }
  })
  .catch((error) => {
    Shopify.onError('Error:', error);
  });

};

// ---------------------------------------------------------
// POST to cart/add.js returns the JSON of the line item.
// ---------------------------------------------------------
Shopify.addItemFromForm = function(form_id, callback) {
  let form = document.getElementById(form_id);
  let formData = new FormData(form);
  let item = false;
  
  fetch('/cart/add.js', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    Shopify.onItemAdded(data);
    if ((typeof callback) === 'function') {
      callback(data);
    }
  })
  .catch((error) => {
    Shopify.onError('Error:', error);
  });
};

// ---------------------------------------------------------
// GET cart.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.getCart = function(callback) {
  fetch('/cart.js')
  .then(response => response.json())
  .then(data => { 
    if ((typeof callback) === 'function') {
      callback(data);
    } else {
     return data; 
    }
  });
};

Shopify.pollForCartShippingRatesForDestination = function(shippingAddress, callback, errback) {
  errback = errback || Shopify.onError;
  var poller = function() {
    jQuery.ajax('/cart/async_shipping_rates', {
      dataType: 'json',
      success: function(response, textStatus, xhr) {
        if (xhr.status === 200) {
          if ((typeof callback) == 'function') {
            callback(response.shipping_rates, shippingAddress)
          } else {
            Shopify.onCartShippingRatesUpdate(response.shipping_rates, shippingAddress)
          }
        } else {
          setTimeout(poller, 500)
        }
      },
      error: errback
    })
  }

  return poller;
}

Shopify.getCartShippingRatesForDestination = function(shippingAddress, callback, errback) {
  errback = errback || Shopify.onError;
  var params = {
    type: 'POST',
    url: '/cart/prepare_shipping_rates',
    data: Shopify.param({'shipping_address': shippingAddress}),
    success: Shopify.pollForCartShippingRatesForDestination(shippingAddress, callback, errback),
    error: errback
  }

  jQuery.ajax(params);
}

// ---------------------------------------------------------
// GET products/<product-handle>.js returns the product in JSON.
// ---------------------------------------------------------
Shopify.getProduct = function(handle, callback) {
  fetch('/products/' + handle + '.js')
  .then(response => response.json())
  .then(data => { 
    Shopify.onProduct(data);
    if ((typeof callback) === 'function') {
      callback(data);
    }
  });
};

// ---------------------------------------------------------
// POST to cart/change.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.changeItem = function(variant_id, quantity, callback) {
  
  let item_ele = (quantity==0)?document.querySelectorAll('.order-list li[data-variant-id="'+variant_id+'"]'):false;
  let formData = { id: String(variant_id), quantity: quantity };
  let item = false;

  fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if(item_ele) item_ele.forEach((ele) => { ele.remove(); });  /* loop through all item lists and remove this items element */
    Shopify.onCartUpdate(data);
    if ((typeof callback) === 'function') {
      callback(data);
    }
  })
  .catch((error) => {
    Shopify.onError('Error:', error);
  });
};

// ---------------------------------------------------------
// POST to cart/change.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.removeItem = function(variant_id, callback) {
  
  let formData = { id: String(variant_id), quantity: 0 };

  fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    Shopify.onCartUpdate(data);
    if ((typeof callback) === 'function') {
      callback(data);
    }
  })
  .catch((error) => {
    Shopify.onError('Error:', error);
  });
};

Shopify.removeItems = function(formData, callback) {

  fetch('/cart/update.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {

    Shopify.onCartUpdate(data);
    if ((typeof callback) === 'function') {
      callback(data);
    }
  })
  .catch((error) => {
    Shopify.onError('Error:', error);
  });
};

// ---------------------------------------------------------
// POST to cart/clear.js returns the cart in JSON.
// It removes all the items in the cart, but does
// not clear the cart attributes nor the cart note.
// ---------------------------------------------------------
Shopify.clear = function(callback) {

  fetch('/cart/clear.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    Shopify.onCartUpdate(data);
    if ((typeof callback) === 'function') {
      callback(data);
    }
  })
  .catch((error) => {
    Shopify.onError('Error:', error);
  });
  
};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.updateCartFromForm = function(form_id, callback) {
  
  let updateCartForm = document.getElementById(form_id);
  let formData = new FormData(updateCartForm);

  fetch('/cart/update.js', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    Shopify.onCartUpdate(data);
    if ((typeof callback) === 'function') {
      callback(data);
    }
  })
  .catch((error) => {
    Shopify.onError('Error:', error);
  });

};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// To clear a particular attribute, set its value to an empty string.
// Receives attributes as a hash or array. Look at comments below.
// ---------------------------------------------------------
Shopify.updateCartAttributes = function(attributes, callback) {
  var data = '';
  // If attributes is an array of the form:
  // [ { key: 'my key', value: 'my value' }, ... ]
  if (jQuery.isArray(attributes)) {
    jQuery.each(attributes, function(indexInArray, valueOfElement) {
      var key = attributeToString(valueOfElement.key);
      if (key !== '') {
        data += 'attributes[' + key + ']=' + attributeToString(valueOfElement.value) + '&';
      }
    });
  }
  // If attributes is a hash of the form:
  // { 'my key' : 'my value', ... }
  else if ((typeof attributes === 'object') && attributes !== null) {
    jQuery.each(attributes, function(key, value) {
        data += 'attributes[' + attributeToString(key) + ']=' + attributeToString(value) + '&';
    });
  }
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: data,
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.updateCartNote = function(note, callback) {
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: 'note=' + attributeToString(note),
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};


if (jQuery.fn.jquery >= '1.4') {
  Shopify.param = jQuery.param;
} else {
  Shopify.param = function( a ) {
    var s = [],
      add = function( key, value ) {
        // If value is a function, invoke it and return its value
        value = jQuery.isFunction(value) ? value() : value;
        s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
      };

    // If an array was passed in, assume that it is an array of form elements.
    if ( jQuery.isArray(a) || a.jquery ) {
      // Serialize the form elements
      jQuery.each( a, function() {
        add( this.name, this.value );
      });

    } else {
      for ( var prefix in a ) {
        Shopify.buildParams( prefix, a[prefix], add );
      }
    }

    // Return the resulting serialization
    return s.join("&").replace(/%20/g, "+");
  }

  Shopify.buildParams = function( prefix, obj, add ) {
    if ( jQuery.isArray(obj) && obj.length ) {
      // Serialize array item.
      jQuery.each( obj, function( i, v ) {
        if ( rbracket.test( prefix ) ) {
          // Treat each array item as a scalar.
          add( prefix, v );

        } else {
          Shopify.buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, add );
        }
      });

    } else if ( obj != null && typeof obj === "object" ) {
      if ( Shopify.isEmptyObject( obj ) ) {
        add( prefix, "" );

      // Serialize object item.
      } else {
        jQuery.each( obj, function( k, v ) {
          Shopify.buildParams( prefix + "[" + k + "]", v, add );
        });
      }

    } else {
      // Serialize scalar item.
      add( prefix, obj );
    }
  }

  Shopify.isEmptyObject = function( obj ) {
    for ( var name in obj ) {
      return false;
    }
    return true;
  }
}


/* Used by Tools */

function floatToString(numeric, decimals) {
  var amount = numeric.toFixed(decimals).toString();
  if(amount.match(/^\.\d+/)) {return "0"+amount; }
  else { return amount; }
}

/* Used by API */

function attributeToString(attribute) {
  if ((typeof attribute) !== 'string') {
    // Converts to a string.
    attribute += '';
    if (attribute === 'undefined') {
      attribute = '';
    }
  }
  // Removing leading and trailing whitespace.
  return jQuery.trim(attribute);
}