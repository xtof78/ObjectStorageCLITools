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
var Promise = require('bluebird');

Promise.promisifyAll(fs);

var mode;
var filename;
var filepath;
var objectname; 
var filefqn;
var container;

var filelist = [];

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
				console.error( "ERROR: Call returned ", r );
			}
			else
			{
			}

			// console.log( r );
	    });;
} else if ( command === "uploaddir" )
{
	var container = process.argv[5];
	var dirname  = process.argv[6];
   var stat = null;
   var os = new ObjectStore(userid, password, projectId, container, region);

	console.log( "ObjectStorage Container: " + container );

   filelist = [];

   doReadDir( "files/", dirname );
   
   console.log( "FileList ", filelist)

   Promise.each( filelist, function (f, index, length) {

      return new Promise( function(resolve, reject) {
         console.log( "Emitting file: " + f + "/ " + index + " of " + length );
      
         var buffer;
         if ( f.indexOf( ".empty" ) >= 0 )
         {
            buffer = null;

            os.uploadFile(dirname + "/" + f, "application/binary", buffer, 0)
            .then(function(r) {
                  console.error( "ERROR: Call returned ", r );
                  if ( ( r.statusCode != 200 ) && ( r.statusCode != 201 ) )
                  {
                     console.error( "ERROR: Call returned " + r.statusCode + " : " + r.statusMessage)
                     reject(r.statusCode);
                  }
                  else
                  {
                     console.error( "OK: Sent correctly" );
                     resolve(r.statusCode);
                  }
            });
         }
         else
         {
            buffer = fs.readFileSync( f, { "flag": "r" } );
            console.log( "File size: " + buffer.length );

            os.uploadFile(dirname + "/" + f, "application/binary", buffer, buffer.length)
            .then(function(r) {
                  console.error( "ERROR: Call returned ", r );
                  if ( ( r.statusCode != 200 ) && ( r.statusCode != 201 ) )
                  {
                     console.error( "ERROR: Call returned " + r.statusCode + " : " + r.statusMessage)
                     reject(r.statusCode);
                  }
                  else
                  {
                     console.error( "OK: Sent correctly" );
                     resolve(r.statusCode);
                  }
            });
         }
      }); 
   }) /*
   .catch(e)
   {
      console.error( "ERROR: Exception during sending of directory: " + e );
   }*/ ; 
}

function doReadDir( root, dirname )
{
   // List the files
   var files = fs.readdirSync( root + dirname );
   var f;

   console.log( "Directory to send:       " + root + dirname );
   filelist.push( root + dirname + "/.empty" );

   for ( f in files )
   {
      stat = fs.statSync( root + dirname + "/" + files[f] );
      if ( stat.isDirectory() )
      {
         console.log( "Send dir: files/" + dirname + "/" + files[f] );
         doReadDir( root, dirname + "/" + files[f] );
      }
      else
      {
         if ( files[f] === ".DS_Store" )
         {
            console.log( "Ignoring file: " + root + dirname + "/" + files[f] );
         }
         else
         {
            console.log( "Send file: " + root + dirname + "/" + files[f] );
            filelist.push( root + dirname + "/" + files[f] );
         }
      }
   }
}
