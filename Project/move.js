// OBJViewer.js (c) 2012 matsuda and itami
// Vertex shader program
var TEX_VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program
var TEX_FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

var OBJ_VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform vec3 u_DiffuseLight;\n' +   // Diffuse light color obj
  'uniform vec3 u_LightDirection;\n' + // Diffuse light direction (in the world coordinate, normalized)
  'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light 环境光
  'uniform mat4 u_ModelMatrix;\n' +   //add Model matrix
  'uniform mat4 u_NormalMatrix;\n' +  //add Transformation matrix of the normal
  'uniform vec3 u_LightColor;\n' +    //add Light color
  'uniform vec3 u_LightPosition;\n' + //add Position of the light source (in the world coordinate system)
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  float nDotL = max(dot(u_LightDirection,normal), 0.0);\n' +
  '  vec3 diffuse = u_DiffuseLight * a_Color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * u_DiffuseLight.rgb;\n' +
	// point light
  '  vec3 normal2 = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate world coordinate of vertex
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
     // The dot product of the light direction and the normal
  '  float nDotL2 = max(dot(lightDirection, normal2), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 point = u_LightColor * a_Color.rgb * nDotL2;\n' +

  '  v_Color = vec4(point + diffuse + ambient, a_Color.a);\n' +
  '}\n';

// Fragment shader program
var OBJ_FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var length = 6;//obj file number
var g_objDoc = new Array(length);      // The information of OBJ file
var g_drawingInfo = new Array(length); // The information for drawing 3D model
for (var i=0;i<length ;i++ )
{
	g_drawingInfo[i] = null;g_objDoc[i]=null;
}

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  var objprogram = createProgram(gl,OBJ_VSHADER_SOURCE, OBJ_FSHADER_SOURCE);
  var texprogram = createProgram(gl,TEX_VSHADER_SOURCE, TEX_FSHADER_SOURCE);
  if (!objprogram||!texprogram) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0,1.0);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
/********************************************/
/*                 cube & floor               */
/*                                          */
  texprogram.a_Position = gl.getAttribLocation(texprogram, 'a_Position');
  texprogram.a_TexCoord = gl.getAttribLocation(texprogram, 'a_TexCoord');
  texprogram.u_MvpMatrix = gl.getUniformLocation(texprogram, 'u_MvpMatrix');
  texprogram.u_Sampler = gl.getUniformLocation(texprogram, 'u_Sampler');
  if (texprogram.a_Position < 0 || texprogram.a_TexCoord < 0 || 
    !texprogram.u_MvpMatrix ||!texprogram.u_Sampler) { 
    console.log('Failed to get the storage location of attribute or uniform variable'); 
    return;
  }
	//set textures
  var texture,texture2;
  texture = gl.createTexture();   // Create a texture object
  texture2 = gl.createTexture();
  if (!texture||! texture2) {
    console.log('Failed to create the texture object');
    return false;
  }
  var tex = initVertexBuffers(gl,texprogram,1);
  if (!tex) {
  	console.log('Failed to set the vertex information');
	return;
  }
	//load tex1 2
  tex_initVertexBuffers(gl,texprogram);
  if (!initTextures(gl,texprogram, texture,texture2)) {
	console.log('Failed to intialize the texture.');
	return;
  }
	//read cube & floor
  var cube = initVertexBuffers_Cube(gl, boxRes);
  var floor = initVertexBuffers_Cube(gl, floorRes);
  if(!cube||!floor){
 	console.log('Failed to intialize the texture.');
	return;
  }
/*                                          */
/********************************************/

  // Get the storage locations of attribute and uniform variables
  gl.useProgram(objprogram);
  objprogram.a_Position = gl.getAttribLocation(objprogram, 'a_Position');
  objprogram.a_Normal = gl.getAttribLocation(objprogram, 'a_Normal');
  objprogram.a_Color = gl.getAttribLocation(objprogram, 'a_Color');
  objprogram.u_MvpMatrix = gl.getUniformLocation(objprogram, 'u_MvpMatrix');
  objprogram.u_NormalMatrix = gl.getUniformLocation(objprogram, 'u_NormalMatrix');

  if (objprogram.a_Position < 0 ||  objprogram.a_Normal < 0 || objprogram.a_Color < 0 ||
      !objprogram.u_MvpMatrix || !objprogram.u_NormalMatrix) {
    console.log('fail to intialize attribute, uniform');
    return;
  }

  objprogram.u_DiffuseLight = gl.getUniformLocation(objprogram, 'u_DiffuseLight');
  objprogram.u_LightDirection = gl.getUniformLocation(objprogram, 'u_LightDirection');
  objprogram.u_AmbientLight = gl.getUniformLocation(objprogram, 'u_AmbientLight');
  if ( !objprogram.u_DiffuseLight || !objprogram.u_LightDirection 
	  || !objprogram.u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }
  objprogram.u_ModelMatrix = gl.getUniformLocation(objprogram, 'u_ModelMatrix');
  objprogram.u_NormalMatrix = gl.getUniformLocation(objprogram, 'u_NormalMatrix');
  objprogram.u_LightColor = gl.getUniformLocation(objprogram, 'u_LightColor');
  objprogram.u_LightPosition = gl.getUniformLocation(objprogram, 'u_LightPosition');
  if ( !objprogram.u_NormalMatrix || !objprogram.u_LightColor 
		|| !objprogram.u_LightPosition) { 
    console.log('Failed to get the storage location');
    return;
  }
  
  gl.uniform3f(objprogram.u_AmbientLight, 
	  sceneAmbientLight[0],sceneAmbientLight[1],sceneAmbientLight[2]);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3(sceneDirectionLight);
  lightDirection.normalize();     // Normalize
  // Set the ambient light
  gl.uniform3fv(objprogram.u_LightDirection, lightDirection.elements);


  
  var model = new Array(length);
  for (var i=0;i<length ;i++ )
  {
	model[i] = initVertexBuffers(gl, objprogram,2);
	if (!model[i]) {
		console.log('Failed to set the vertex information');
		return;
	}
  }
  // Start reading the OBJ file
  for(var i=0;i<length;i++){
	readOBJFile(ObjectList[i].objFilePath, gl, model[i], 1, true,i,g_drawingInfo[i]);
  }

  var camera = CameraPara;
  var message = document.getElementById('messageBox');
  var message2 = document.getElementById('messageBox2');
  message2.innerHTML = "look at:"+camera.at[0].toFixed(1)+" "+camera.at[1].toFixed(1)+
	" "+camera.at[2].toFixed(1);
  message.innerHTML = "position:"+camera.eye[0].toFixed(1)+" "+camera.eye[1].toFixed(1)+
	" "+camera.eye[2].toFixed(1);
  var currentAngle = 0.0; // Current rotation angle [degree]  
  // Set the light direction (in the world coordinate)
  var tick = function() {   // Start drawing
    currentAngle = animate(currentAngle); // Update current rotation angle
	var viewM = new Matrix4();
	
    var viewProjMatrix = new Matrix4();
	viewProjMatrix.setPerspective(camera.fov, canvas.width/canvas.height,
		camera.near, camera.far);
	gl.useProgram(objprogram);
	document.onkeypress = function(ev){ 
		keydown(ev, gl,camera); };
	document.onkeyup = function(ev){ 
		keyup(ev, gl); };
	viewProjMatrix.lookAt(camera.eye[0],camera.eye[1], camera.eye[2],
	  camera.at[0],camera.at[1],camera.at[2],
	  camera.up[0],camera.up[1],camera.up[2]);
	//set the tense & position of point light
    gl.uniform3f(objprogram.u_LightColor, pointcolor[0],pointcolor[1],pointcolor[2]);
	gl.uniform3f(objprogram.u_LightPosition, camera.at[0],camera.at[1],camera.at[2]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//draw
	draw(gl, objprogram, currentAngle, viewProjMatrix, model,g_drawingInfo);
	texdraw(gl,texprogram,viewProjMatrix,texture,texture2,cube,floor,canvas);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}
/****************************************/
var e = 0,ew=0;//e left&right ew up&down
var pointcolor = [0.0,0.0,0.0],snowsnow = true;
function keyup(ev,gl){
	if(snowsnow==false){
		pointcolor = [0.0,0.0,0.0];
		snowsnow = true;
	}
}
function keydown(ev, gl,camera) {
	var snow = 0.6;
	//ikjl
	if(ev.keyCode==102){  // The f arrow key was pressed
	    snowsnow = false;
		pointcolor = [scenePointLightColor[0],scenePointLightColor[1],scenePointLightColor[2]];
	}

	//addddd Set the light color (white)
    if(ev.keyCode == 105) { // The i arrow key was pressed
	  ew+=2;
    } else if (ev.keyCode == 107) { // The k arrow key was pressed
      ew-=2;
    }else if(ev.keyCode == 106) { // The j arrow key was pressed
	  e-=2;
    } else if (ev.keyCode == 108) { // The l arrow key was pressed
      e+=2;
    }
	camera.at[0]=camera.eye[0]+Math.sin(2*Math.PI/360*e)-Math.sin(2*Math.PI/360*e)*(1-Math.cos(2*Math.PI/360*ew));
	camera.at[1]=camera.eye[1]+Math.sin(2*Math.PI/360*ew);
	camera.at[2]=camera.eye[2]-Math.cos(2*Math.PI/360*e)+(1-Math.cos(2*Math.PI/360*ew))*Math.cos(2*Math.PI/360*e);
    
	//wsad
	if(ev.keyCode == 119) { // The w arrow key was pressed
	  camera.eye[0]+=snow*Math.sin(2*Math.PI/360*e);
	  camera.at[0]+=snow*Math.sin(2*Math.PI/360*e);
	  camera.eye[1]+=snow*Math.sin(2*Math.PI/360*ew);
	  camera.at[1]+=snow*Math.sin(2*Math.PI/360*ew);
	  camera.eye[2]-=snow*Math.cos(2*Math.PI/360*e);
	  camera.at[2]-=snow*Math.cos(2*Math.PI/360*e);
    } else if (ev.keyCode == 115) { // The s arrow key was pressed
      camera.eye[0]-=snow*Math.sin(2*Math.PI/360*e);
	  camera.at[0]-=snow*Math.sin(2*Math.PI/360*e);
	  camera.eye[1]-=snow*Math.sin(2*Math.PI/360*ew);
	  camera.at[1]-=snow*Math.sin(2*Math.PI/360*ew);
	  camera.eye[2]+=snow*Math.cos(2*Math.PI/360*e);
	  camera.at[2]+=snow*Math.cos(2*Math.PI/360*e);
    }else if(ev.keyCode == 97) { // The a arrow key was pressed
	  camera.eye[2]-=snow*Math.sin(2*Math.PI/360*e);
	  camera.at[2]-=snow*Math.sin(2*Math.PI/360*e);
	  camera.eye[1]+=snow*Math.sin(2*Math.PI/360*ew);
	  camera.at[1]+=snow*Math.sin(2*Math.PI/360*ew);
	  camera.eye[0]-=snow*Math.cos(2*Math.PI/360*e);
	  camera.at[0]-=snow*Math.cos(2*Math.PI/360*e);
    } else if (ev.keyCode == 100) { // The d arrow key was pressed
      camera.eye[2]+=snow*Math.sin(2*Math.PI/360*e);
	  camera.at[2]+=snow*Math.sin(2*Math.PI/360*e);
	  camera.eye[1]-=snow*Math.sin(2*Math.PI/360*ew);
	  camera.at[1]-=snow*Math.sin(2*Math.PI/360*ew);
	  camera.eye[0]+=snow*Math.cos(2*Math.PI/360*e);
	  camera.at[0]+=snow*Math.cos(2*Math.PI/360*e);
    }
	/*****/

	var message = document.getElementById('messageBox');
	var message2 = document.getElementById('messageBox2');
	message2.innerHTML = "look at:"+camera.at[0].toFixed(1)+" "+camera.at[1].toFixed(1)+
		" "+camera.at[2].toFixed(1);
	message.innerHTML = "position:"+camera.eye[0].toFixed(1)+" "+camera.eye[1].toFixed(1)+
		" "+camera.eye[2].toFixed(1);
}

//texdraw
function texdraw(gl,program,viewProjMatrix,texture,texture2,cube,floor,canvas) {
  // Set the matrix to be used for to set the camera view
	gl.useProgram(program);
	var mvp_button = new Matrix4();
	mvp_button.set(viewProjMatrix);
	var mvp_cube = new Matrix4();
	mvp_cube.set(viewProjMatrix);
	mvp_button.scale(floorRes.scale[0],floorRes.scale[1],floorRes.scale[2]);
  // Pass the view projection matrix
	gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvp_button.elements);

	gl.bindTexture(gl.TEXTURE_2D, texture2);
	initAttributeVariable(gl, program.a_Position, floor.vertexBuffer,3,gl.FLOAT);  // Vertex coordinates
	initAttributeVariable(gl, program.a_TexCoord, floor.texCoordBuffer,2,gl.FLOAT);// Texture coordinates
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floor.indexBuffer); // Bind indices
	gl.drawElements(gl.TRIANGLES, floor.numIndices, floor.indexBuffer.type, 0);   // Draw floor
  //set mvp of cube
  
	mvp_cube.translate(boxRes.translate[0],boxRes.translate[1],boxRes.translate[2]);
	mvp_cube.scale(boxRes.scale[0],boxRes.scale[1],boxRes.scale[2]);
	gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvp_cube.elements);
  // draw cube
	gl.bindTexture(gl.TEXTURE_2D, texture);
	initAttributeVariable(gl, program.a_Position, cube.vertexBuffer,3,gl.FLOAT);  // Vertex coordinates
	initAttributeVariable(gl, program.a_TexCoord, cube.texCoordBuffer,2,gl.FLOAT);// Texture coordinates
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indexBuffer); // Bind indices
	gl.drawElements(gl.TRIANGLES, cube.numIndices, cube.indexBuffer.type, 0);   // Draw
}
//load texture pic
function initTextures(gl,program,texture,texture2) {
  // Get the storage location of u_Sampler
// load pic
	var image = new Image();  // Create the image object
	var image2 = new Image();
	if (!image||!image2) {
	  console.log('Failed to create the image object');
	  return false;
	}
  // Register the event handler to be called on loading an image
	image.onload = function(){ loadTexture(gl, texture, program.u_Sampler, image); };
  // Tell the browser to load an image
	image.src = './image/boxface.bmp';
	image2.onload = function(){ loadTexture(gl, texture2, program.u_Sampler, image2); };
  // Tell the browser to load an image
	image2.src = './image/floor.jpg';
 //draw(gl);
	return true;
}
//load texture
function loadTexture(gl, texture, u_Sampler, image) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
	gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
	gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set the texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
  // Set the texture unit 0 to the sampler
	gl.uniform1i(u_Sampler, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
	gl.bindTexture(gl.TEXTURE_2D, null);
}
//set texture position
function tex_initVertexBuffers(gl,program) {
	var verticesTexCoords = new Float32Array([
    // Vertex coordinates, texture coordinate
		-0.5,  0.5,   0.0, 1.0,
		-0.5, -0.5,   0.0, 0.0,
		 0.5,  0.5,   1.0, 1.0,
		 0.5, -0.5,   1.0, 0.0,
	]);
	var n = 4; // The number of vertices
  // Create the buffer object
	var vertexTexCoordBuffer = gl.createBuffer();
	if (!vertexTexCoordBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
  // Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
	var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
	gl.vertexAttribPointer(program.a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
	gl.enableVertexAttribArray(program.a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  // Assign the buffer object to a_TexCoord variable
	gl.vertexAttribPointer(program.a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
	gl.enableVertexAttribArray(program.a_TexCoord);  // Enable the assignment of the buffer object

	return n;
}
//read cube & floor and return with saved o
function initVertexBuffers_Cube(gl, res) {
	var vertices = new Float32Array( res.vertex);
	var texCoords = new Float32Array( res.texCoord);
  // Indices of the vertices
	var indices = new Uint8Array( res.index);
  // Create a buffer object

	var o = new Object(); // Utilize Object to to return multiple buffer objects together
  // Write vertex information to buffer object
	o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
	o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
	o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
	if (!o.vertexBuffer || !o.texCoordBuffer || !o.indexBuffer) return null; 
	o.numIndices = indices.length;
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	return o;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
	var buffer = gl.createBuffer();　  // Create a buffer object
	if (!buffer) {
		console.log('Failed to create the buffer object');
		return null;
	}
  // Write date into the buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

	buffer.type = type;

	return buffer;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
	var buffer = gl.createBuffer();   // Create a buffer object
	if (!buffer) {
		console.log('Failed to create the buffer object');
		return null;
	}
  // Write date into the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Keep the information necessary to assign to the attribute variable later
	buffer.num = num;
	buffer.type = type;

	return buffer;
}


// Create an buffer object and perform an initial configuration
function initVertexBuffers(gl, program,n) {
	var o = new Object(); // Utilize Object object to return multiple buffer objects
	o.vertexBuffer = createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT); 
	if(n==2){// 2为 obj  1为 tex
		o.normalBuffer = createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT);
		o.colorBuffer = createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT);
		if(!o.normalBuffer || !o.colorBuffer){ return null; }
	}else if(n==1){

	}
	o.indexBuffer = gl.createBuffer();
	if (!o.vertexBuffer  || !o.indexBuffer) { return null; }

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return o;
}

// Create a buffer object, assign it to attribute variables, and enable the assignment
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
	var buffer =  gl.createBuffer();  // Create a buffer object
	if (!buffer) {
	  console.log('Failed to create the buffer object');
	  return null;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
	gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

	return buffer;
}

// Read a file
function readOBJFile(fileName, gl, model, scale, reverse,i,g_drawingInfo) {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
	  if (request.readyState === 4 && request.status !== 404) {
	   onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse,i,g_drawingInfo);
	  }
	}
	request.open('GET', fileName, true); // Create a request to acquire the file
	request.send();                      // Send the request
}


// OBJ File has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse,i,g_drawingInfo ) {
	var objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
	var result = objDoc.parse(fileString, scale, reverse); // Parse the file
	if (!result) {
		g_objDoc = null; g_drawingInfo = null;
		console.log("OBJ file parsing error.");
		return;
	}
	g_objDoc[i] = objDoc;
}

// Coordinate transformation matrix

// draw
function draw(gl, program, angle, viewProjMatrix, model,g_drawingInfo) {
	gl.useProgram(program);
	var model0=model[0],model1=model[1],model2=model[2],
		model3=model[3],model4=model[4],model5=model[5];
	for (var i=0;i<length ;i++ )
	{
		if (g_objDoc[i] != null && g_objDoc[i].isMTLComplete()){ // OBJ and all MTLs are available
			g_drawingInfo[i] = onReadComplete(gl, model[i], g_objDoc[i]);
			g_objDoc[i] = null;
		}
		if (!g_drawingInfo[i]) return;
	}

	for (var j=0;j<length ;j++ ){
		var g_modelMatrix = new Matrix4();
		var g_normalMatrix = new Matrix4();
		var g_mvpMatrix = new Matrix4();
  // model 1 
		switch (j){
			case 0: var model = model0;break;
			case 1: var model = model1;break;
			case 2: var model = model2;break;
			case 3: var model = model3;break;
			case 4: var model = model4;break;
			case 5: var model = model5;break;
			default:var model = model0;
		}
		gl.uniform3f(program.u_DiffuseLight, ObjectList[j].color[0],
			ObjectList[j].color[1],ObjectList[j].color[2]);
		//reset
		g_modelMatrix.setTranslate(0.0,0.0,0.0);
		for (var i=0;i<=ObjectList[j].transform.length-1 ;i++ ){
			var snow = ObjectList[j].transform[i];
			if (snow.type == "rotate"){
				g_modelMatrix.rotate(snow.content[0],snow.content[1],snow.content[2],snow.content[3]);
			}else if (snow.type == "translate"){
				g_modelMatrix.translate(snow.content[0],snow.content[1],snow.content[2]);
			}else if(snow.type == "scale"){
				g_modelMatrix.scale(snow.content[0],snow.content[1],snow.content[2]);
			}
		}
		//flying bird
		if(j==1){
			var r = 2;
			var l = 2*r*Math.sin(angle/2);
			g_modelMatrix.translate(l*Math.sin(angle/2), l/3*Math.sin(angle/2), l*Math.cos(angle/2));
			g_modelMatrix.rotate(35*Math.sin(angle), -1.0, 0.0, 0.0);
			g_modelMatrix.rotate(80+angle*115/2%360, 0.0, 1.0, 0.0);
		}/****/
  
  // Calculate the normal transformation matrix and pass it to u_NormalMatrix
		g_normalMatrix.setInverseOf(g_modelMatrix);
		g_normalMatrix.transpose();
		gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

  // Calculate the model view project matrix and pass it to u_MvpMatrix
		g_mvpMatrix.set(viewProjMatrix);
		g_mvpMatrix.multiply(g_modelMatrix);
		gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

		initAttributeVariable(gl,program.a_Position,model.vertexBuffer, 3, gl.FLOAT);
		initAttributeVariable(gl,program.a_Normal,model.normalBuffer, 3, gl.FLOAT);
		initAttributeVariable(gl,program.a_Color,model.colorBuffer, 4, gl.FLOAT);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
		gl.drawElements(gl.TRIANGLES, g_drawingInfo[j].indices.length, gl.UNSIGNED_SHORT, 0);
	}
}
function initAttributeVariable(gl,a_attribute,buffer, num, type){
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.vertexAttribPointer(a_attribute,num, type,false,0,0);
	gl.enableVertexAttribArray(a_attribute);
}

function bindbufferNo(gl){
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
// OBJ File has been read compreatly
function onReadComplete(gl, model, objDoc) {
  // Acquire the vertex coordinates and colors from OBJ file
	var drawingInfo = objDoc.getDrawingInfo();

  // Write date into the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

  // Write the indices to the buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
		
	return drawingInfo;
}

var ANGLE_STEP = 30;   // The increments of rotation angle (degrees)

var last = Date.now(); // Last time that this function was called
function animate(angle,time) {
	var now = Date.now();   // Calculate the elapsed time
	var elapsed = now - last;
	last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = angle + (ANGLE_STEP * elapsed) / 30000.0;
	return newAngle % 360;
}
