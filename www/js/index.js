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
	setTimeout( function() 
  {
	  $( '#theWelcomePopup' ).popup( 'open' );
  }, 500);
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

$( '#analysisbtn' ).one( 'click', function() // Runs only once, avoids loading on every click
{
    Chart.defaults.global.responsive = true; // Charts scale to width
    
    // Get context with jQuery - using jQuery's .get() method.
    var canvas = '#myChart';
    
    var ctx = $( canvas ).get(0).getContext("2d");
    // This will get the first returned node in the jQuery collection.
    var myNewChart = new Chart(ctx);
    
    var data = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
	{
	    label: "My First dataset",
	    fillColor: "rgba(220,220,220,0.2)",
			 strokeColor: "rgba(220,220,220,1)",
			 pointColor: "rgba(220,220,220,1)",
			 pointStrokeColor: "#fff",
			 pointHighlightFill: "#fff",
			 pointHighlightStroke: "rgba(220,220,220,1)",
			 data: [65, 59, 80, 81, 56, 55, 40]
	},
	{
	    label: "My Second dataset",
	    fillColor: "rgba(151,187,205,0.2)",
			 strokeColor: "rgba(151,187,205,1)",
			 pointColor: "rgba(151,187,205,1)",
			 pointStrokeColor: "#fff",
			 pointHighlightFill: "#fff",
			 pointHighlightStroke: "rgba(151,187,205,1)",
			 data: [28, 48, 40, 19, 86, 27, 90]
	}
	]
    };
    
    var options = '';
    
    $( canvas ).parent().css( "padding", "0" );
    
    new Chart(ctx).Line(data, options);
    
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
	    $( '.farm-name' ).text( "Farm" );
	}
	else if( value != "" )
	{
	    $( '.farm-name' ).text( value );
	}
    });
}

$( '#fieldbtn' ).one( 'click', function()
{
    $.ajax
	({
		type: "GET",
		url: "CropNutrientContents-YieldUnitChanges-Oct-03.xml",
		dataType: "xml",
		success:
		function( xml )
		{
		    $( xml ).find( 'Crop' ).each( function( index, element )
			{
			    $( '#addcrop' ).append
			    (
				'<li class="ui-screen-hidden ui-btn ui-btn-icon-right ui-icon-plus">'
					+ $( element ).text() +
				'</li>'
			    ); // Uses name of crop as text contents
			});
		},
	});
});

var selectedcrops;

$( '#addcrop' ).on( 'click', 'li', function()
{    
	submitbutton = '#submitcroplist';
    
	$( this ).toggleClass( 'ui-icon-plus ui-icon-check' );
	selectedcrops = $( '#addcrop > .ui-icon-check' );
	if( selectedcrops.length > 0 )
	{
	    $( submitbutton ).show();
	}
	else if( selectedcrops.length < 1 )
	{
	    $( submitbutton ).hide();
	}
});

$(  '#submitcroplist' ).click(function()
{
    $.each( selectedcrops, function( index, value )
    {
	console.log( value );
    });
});

$( '.customcropfield' ).change(function()
{
	// @TODO: Add validation function here
});

$( '#submitcustomcrop' ).click(function()
{
	cropname = ( '#cropname' ).val();
	// @TODO: Add check for at least one nutrient
	
	//if( cropname != null && )
})