/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses portions of this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var setupfields = $( 'div' ).children( 'input' ); // Find all children of divs - in jQuery mobile, divs automatically wrap input fields. May have to fix for other types of fields. Returns object
var requiredfields = $( 'div' ).children( '.requiredform' );

var app = {
    // Application Constructor
    initialize: function() {
	this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
	document.addEventListener('deviceready', this.onDeviceReady, false);
	document.addEventListener('pagecreate', farmnamer(), false); // Changed from fork
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
	app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
	var parentElement = document.getElementById(id);
	var listeningElement = parentElement.querySelector('.listening');
	
	localforage.getItem( 'soil_set_up', function( err, value )
	{
	    if( value == true )
	    {
		setup_exit();
		// If skipping setup, write the setting values to the fields
		$.each( setupfields, function( index, value )
		{
		    var fieldname = $( value ).attr ('name');
		    
		    localforage.getItem( fieldname, function(err, valueretrieved)
		    {
			$( value ).val( valueretrieved );
		    });
		});
	    }
	});
	
	$( listeningElement ).hide( 'fast' );
	$( '#setupbox' ).show( 'fast' ); // Change from fork
	
	console.log('Received Event: ' + id);
    }
    
    
};

$( '#setupnext' ).click(function()
{
    
    $.each( setupfields, function( index, value )
    {
	var fieldvalue = $( value ).val();
	var fieldname = $( value ).attr ('name');
	
	localforage.setItem( fieldname, fieldvalue, function(err, valuestored) {
	    $( value ).val( valuestored );  // This clears the field for an invalid value, which is returned as null
	});
    });
    
    var setuperror = false;
    $.each( requiredfields, function( index, value )
    {
	var fieldvalue = $( value ).val();
	
	if(fieldvalue == "")
	{
	    setuperror = true;
	    localforage.setItem( 'soil_set_up', false );
	}
    });
    
    if( setuperror == false )
    {
	setup_exit();
    }
    
    farmnamer();
});

function setup_exit()
{
    localforage.setItem( 'soil_set_up', true );
    $( ':mobile-pagecontainer' ).pagecontainer( 'change', '#main' ); // Same as #main
}

function farmnamer()
{
    localforage.getItem( 'farmname', function(err, value)
    {
	if( value == "" )
	{
	    $( '.farm-name' ).text( "My Farm" );
	}
	else if( value != "" )
	{
	    $( '.farm-name' ).text( value );
	}
    });
}