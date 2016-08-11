/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Author: Christophe CAPILLON
 **/

var ObjectStore = require('./lib/ObjectStorage');
var fsextra = require("fs-extra");
var fs = require("fs");
var localdir = __dirname;
// var uuid = require('node-uuid').v4();

var mode;
var filename;
var filepath;
var objectname; 
var filefqn;
var container;

console.log( "Retrieving parameters 'Region,ProjectId,[Container,UserId,Password]'" );

if ( process.argv.length < 5 )
{
	console.log( "ERROR: Minimum 4 parameters: node cli.js Region ProjectId Command" );
	process.exit(1);
}

var userid   = process.env.OSUSERID || "<NONE FOUND IN ENV>";
var password = process.env.OSPASSWORD || "<NONE FOUND IN ENV>";

console.log( "ObjectStorage User ID:   " + userid );
console.log( "ObjectStorage Password:  " + password );

var region    = process.argv[2];
var projectId = process.argv[3];
var command   = process.argv[4];

console.log( "ObjectStorage Region:    " + region );
console.log( "ObjectStorage ProjectId: " + projectId );
console.log( "\nCommand: " + command );

//
// Check Command
//
if ( command === "listcontainers" )
{
	var os = new ObjectStore(userid, password, projectId, "", region);
	os.listContainers()
		.then(function(r) {
			console.log( r );
	    });;
} else if ( command === "listcontainerfiles" )
{
	var container = process.argv[5];
	console.log( "ObjectStorage Container: " + container );

	var os = new ObjectStore(userid, password, projectId, container, region);
	os.listContainerFiles()
		.then(function(r) {
			console.log( r );
	    });;
} else if ( command === "download" )
{
	var container = process.argv[5];
	var objectname  = process.argv[6];
	console.log( "ObjectStorage Container: " + container );
	console.log( "ObjectStorage Filename:  " + objectname );

	var os = new ObjectStore(userid, password, projectId, container, region);
	os.downloadFile(objectname)
		.then(function(r) {
			if ( r.statusCode != 200 )
			{
				console.error( "ERROR: Call returned " + r.statusCode + " : " + r.statusMessage)
			}
			else
			{
				var file = fs.openSync( "files/" + objectname, "w" );
				console.log( "Writing file: " + "files/" + objectname );
				fs.writeFileSync( file, r.body );
				fs.close(file);
			}

			// console.log( r );
	    });;
} else if ( command === "upload" )
{
	var container = process.argv[5];
	var objectname  = process.argv[6];
	console.log( "ObjectStorage Container: " + container );
	console.log( "ObjectStorage Filename:  " + objectname );

	console.log( "Read file: " + "files/" + objectname );
	var buffer = fs.readFileSync( "files/" + objectname, { "flag": "r" } );
	console.log( "File size: " + buffer.length );

	var os = new ObjectStore(userid, password, projectId, container, region);
	os.uploadFile(objectname, "application/binary", buffer, buffer.length)
		.then(function(r) {
			if ( r.statusCode != 200 )
			{
				console.error( "ERROR: Call returned " + r.statusCode + " : " + r.statusMessage)
			}
			else
			{
			}

			// console.log( r );
	    });;
}

/*
appdefdir = process.argv[2];
			// Check mode
         	if ((msg.mode) && (msg.mode.trim() !== "")) {
         		mode = msg.mode;
         	} else {
         		if (node.mode) {
         			mode = node.mode;
         		} else {
         			mode = "1";
         		}
         	}

         	// Check ObjectName 
         	if ((msg.objectname) && (msg.objectname.trim() !== "")) {
         		objectname = msg.objectname;
         	} else {
     			objectname = node.objectname;
         	}

         	// Check Filename
         	if ((msg.filename) && (msg.filename.trim() !== "")) {
         		filename = msg.filename;
         	} else {
     			filename = node.filename;
         	}

			// Check filepath
         	if ((msg.filepath) && (msg.filepath.trim() !== "")) {
         		filepath = msg.filepath;
         	} else {
         		if (node.filepath) {
         			filepath = node.filepath;
         		} else {
         			filepath = localdir;
         		}
         	}

         	// Set FQN for this file
     		filefqn = filepath + filename;
         	
 			// Check container
         	if ((msg.container) && (msg.container.trim() !== "")) {
         		container = msg.container;
         	} else {
         		if (node.container) {
         			container = node.container;
         		} else {
         			container = "Pictures";
         		}
         	}
                
            console.log('ObjectStorage Get ' + node.osconfig.userId +","+ node.osconfig.password +","+ node.osconfig.tendantId+","+ container+","+node.osconfig.region );

	// Enable the Object Storage Service Call
	var os = new ObjectStore(node.osconfig.userId, node.osconfig.password, node.osconfig.tendantId, container, node.osconfig.region);
*/