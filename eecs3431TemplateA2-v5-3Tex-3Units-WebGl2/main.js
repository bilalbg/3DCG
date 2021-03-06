

var canvas;
var gl;

var program ;

var near = -100;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 0.9, 0.9, 0.9, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 100.0;


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix ;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var TIME = 0.0 ; // Realtime
var resetTimerFlag = true ;
var animFlag = false ;
var prevTime = 0.0 ;
var useTextures = 1 ;





// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i =0; i<texSize; i++)  image1[i] = new Array();
for (var i =0; i<texSize; i++)
for ( var j = 0; j < texSize; j++)
image1[i][j] = new Float32Array(4);
for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

for ( var i = 0; i < texSize; i++ )
for ( var j = 0; j < texSize; j++ )
for(var k =0; k<4; k++)
image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];


var textureArray = [] ;

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;
    
    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };
    
    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };
    
    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}


function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

function loadFileTexture(tex, filename)
{
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = "" ; // Important to be empty
    
    gl.bindTexture( gl.TEXTURE_2D, tex.textureWebGL );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, image);
	
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // s-coordinate repeating
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); // t-coordinate repeating
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    tex.isTextureReady = true ;

}

function initTextures() {
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"sunset.bmp") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"ball.jpg") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"ground.jpg") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"fence.jpg") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"cubetexture.png") ;
    
    textureArray.push({}) ;
    loadImageTexture(textureArray[textureArray.length-1],image2) ;
    
    
}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); // s-coordinate repeating
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); // t-coordinate repeating
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}


//----------------------------------------------------------------

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}
function toggleTextures() {
    useTextures = 1 - useTextures ;
    gl.uniform1i( gl.getUniformLocation(program,
                                         "useTextures"), useTextures );
}
function useTexture(t) {
	gl.uniform1i( gl.getUniformLocation(program,
										"useTexture"), t );
}


function waitForTextures1(tex) {
    setTimeout( function() {
    console.log("Waiting for: "+ tex.image.src) ;
    wtime = (new Date()).getTime() ;
    if( !tex.isTextureReady )
    {
        console.log(wtime + " not ready yet") ;
        waitForTextures1(tex) ;
    }
    else
    {
        console.log("ready to render") ;
        window.requestAnimFrame(render);
    }
               },5) ;
    
}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout( function() {
               var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log("boo"+texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               console.log(wtime + " not ready yet") ;
               waitForTextures(texs) ;
               }
               else
               {
               console.log("ready to render") ;
               window.requestAnimFrame(render);
               }
               },5) ;
    
}





window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
 
    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures );

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // set a default material
    setColor(materialDiffuse) ;
    
  
    
    // set the callbacks for the UI elements
    document.getElementById("sliderXi").oninput = function() {
        RX = this.value ;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };
    
    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
    };
    
    
    
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures() ;
        window.requestAnimFrame(render);
    };
    
    document.getElementById("nearestFilterButton").onclick = function() {
		for( i = 0 ; i < textureArray.length ; i++ ) {
			gl.bindTexture(gl.TEXTURE_2D, textureArray[i].textureWebGL);
        	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST) ;
		}
        window.requestAnimFrame(render);
    };
    
    document.getElementById("linearFilterButton").onclick = function() {
		for( i = 0 ; i < textureArray.length ; i++ ) {
			gl.bindTexture(gl.TEXTURE_2D, textureArray[i].textureWebGL);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) ;
		}
        window.requestAnimFrame(render);
    };
	
	document.getElementById("repeatTextButton").onclick = function() {
		for( i = 0 ; i < textureArray.length ; i++ ) {
			gl.bindTexture(gl.TEXTURE_2D, textureArray[i].textureWebGL);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			
		}
		window.requestAnimFrame(render);
		
	};
	
	document.getElementById("clampToEdgeTextButton").onclick = function() {
		for( i = 0 ; i < textureArray.length ; i++ ) {
			gl.bindTexture(gl.TEXTURE_2D, textureArray[i].textureWebGL);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		window.requestAnimFrame(render);
	};

    
    

    var controller = new CameraController(canvas);
    controller.onchange = function(xRot,yRot) {
        RX = xRot ;
        RY = yRot ;
        window.requestAnimFrame(render); };
    
    // load and initialize the textures
    initTextures() ;
    
    // Recursive wait for the textures to load
    waitForTextures(textureArray) ;
    //setTimeout (render, 100) ;
    
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

function render() {
    
    

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    
    eye = vec3(0,0,10);
    eye[1] = eye[1] + 0 ;
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
    
    // initialize the modeling matrix stack
    MS= [] ;
    modelMatrix = mat4() ;
    
    // apply the slider rotations
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    // send all the matrices to the shaders
    setAllMatrices() ;
    
    // get real time
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }
    

    
    //base
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "stexture1"), 0);
    
    //sunset
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "stexture2"), 1);
    
    //ball
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "stexture3"), 2);
    
    //ground
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "stexture4"), 3);
    
    //fence
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[4].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "stexture5"), 4);
    
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[5].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "stexture6"), 5); 
    
    gl.uniform1f( gl.getUniformLocation(program, "time"), TIME );
    
    
    
    gTranslate(0,1,0) ;
    gRotate(-90, 0, 1, 0);
    //fence top
    gPush();
    {
        gTranslate(0,0,3);
        gRotate(90, 0,1,0);
        setColor(vec4(0.545,0.27, 0.07, 1.0));
        //gl.useProgram(program);
        toggleTextures();
        useTexture(4);
        toggleTextures();
        gTranslate(-1.75,-2.8,-3);
        gRotate(-90, 1, 0, 0);
        gScale(0.4,0.2,0.4);
        drawCone();
        gTranslate(1.8,0,0);
        drawCone();
        gTranslate(2,0,0);
        drawCone();
        gTranslate(2,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(1.9,0,0);
        drawCone();
        gTranslate(-16*1.91,0,0);
        drawCone();
        gTranslate(-1.9,0,0);
        drawCone();
    }
    gPop();
    //background
    gPush();{
        
        setColor(vec4(0.0,0.0,1,1.0)) ;
        toggleTextures();
        useTexture(1);
        gTranslate(-4.1,0,0);
        gScale(1, 7, 7);
        drawCube();
    }
    gPop();
    toggleTextures();
    //ground
    gPush();
    {
        setColor(vec4(0.0,1.0,0.0,1.0)) ;
        useTexture(3);
        gTranslate(3.5,-7,0);
        gScale(6.7, 1, 7);
        drawCube();
    }
    gPop();
    
    
    //fence 
    gPush();
    {
        gTranslate(0,0,3);
        gRotate(90, 0,1,0);
        setColor(vec4(0.545,0.27, 0.07, 1.0))
        useTexture(4);
        gTranslate(-1,-4.5,-3);
        gScale(1/3, 1.5, 1/7);
        drawCube();
        gTranslate(-2.3,0,0);
        drawCube();
        gTranslate(4.6,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(2.3,0,0);
        drawCube();
        gTranslate(-16*2.3,0,0);
        drawCube();
        gTranslate(-2.3,0,0);
        drawCube();
        
    }
    gPop();


    //used similar body code from the previous assignment 

    
    gTranslate(Math.sin(TIME), 0, 4*Math.sin(TIME));
    gRotate(-90, 0, 1, 0);
    gRotate(-1*TIME*180/3.14159,0,1,0);
    
    
    //head
    gPush();
    {

        gTranslate(0,-2.2,3);
        gRotate(90, 0, 1, 0);
        gTranslate(4, 1.9, 0);
        gScale(0.5, 0.5, 0.5);
        setColor(vec4(0.9,0.8,0.6,1.0)) ;
        useTexture(6);
        drawSphere() ;
        
        gScale(1/0.5,1/0.5,1/0.5);
        gTranslate(-4,-1.9,0);



        gRotate(-90,0,1,0);

        

        //eye whites

        gTranslate(0.32, 2, -3.8);
        setColor(vec4(1,1,1,1.0)) ;
        gScale(0.2, 0.2, 0.2);
        drawSphere() ;

        gTranslate(0, 0, -2);
        drawSphere() ;
        gTranslate(0,0,2);
        gScale(5,5,5);
        
        gTranslate(-0.32,-2,3.8);

        

        //pupils


        gTranslate(0.43, 2, -4.2);
        gScale(0.13, 0.13, 0.13);
        setColor(vec4(0.25,0.25,0.25,1.0)) ;
        drawSphere();
        gTranslate(0,0,3.3);
        drawSphere();
        gTranslate(0,0,-3.3);
        gScale(1/0.13, 1/0.13, 1/0.13);
        gTranslate(-0.45,-2,4.2);
        
    }
    gPop();

    //arms
    gPush();
    {
            gRotate(8*Math.sin(TIME*2),0,0,1) ;

            //upper arm
            setColor(vec4(0.5,0,0.6,1.0)) ;
            //useTexture(1);
            useTexture(6);
            gTranslate(0.4,-1,0);
            gRotate(-10,0,0,1);
            gScale(0.6, 0.15, 0.2);
            drawCube();
            gScale(1/0.6, 1/0.15, 1/0.2);
            gTranslate(0,0,-1.8);
            gScale(0.6, 0.15, 0.2);
            drawCube();
            gScale(1/0.6, 1/0.15, 1/0.2);
            
            

            //elbow
            gTranslate(0.7,0,0);
            gScale(0.2,0.15,0.2);

            drawSphere() ;
            gScale(5,1/0.15,5);
            gTranslate(0,0,1.8);
            gScale(0.2,0.15,0.2);
            drawSphere();

            gScale(5,1/0.15,5);
            gTranslate(-0.7,0,-1.8);

            gRotate(10,0,0,1);
            
            
            //forearm
            gTranslate(1.25,-0.15,0 );
            gRotate(4*Math.sin(TIME*2),0,0,1) ;
            gScale(0.5, 0.15, 0.2);
            drawCube();
            gScale(1/0.5, 1/0.15, 1/0.2);
            gTranslate(0,0,1.8);
            gScale(0.5, 0.15, 0.2);
            drawCube();
           
            gScale(2,1/0.15,5);
            gTranslate(-1.25, 0, -1.8);


            //hands
            setColor(vec4(0.9,0.8,0.6,1.0)) ;

            gTranslate(1.9,0,0);
            gScale(0.2,0.1,0.2);
            drawCube();

            gScale(5,10,5);
            gTranslate(0,0,1.8);
            gScale(0.2,0.1,0.2);
            drawCube();

            gScale(5,10,5);

    }
    gPop();
    
    //ball
        gTranslate(2.3,-1,0);
    gPush() ;
    {   
        //gRotate(TIME*180/3.14159,0,1,0) ;
        setColor(vec4(1.0,0.0,0.0,1.0)) ;
        useTexture(2);
        gTranslate(0,-2*Math.cos(TIME*2)+0.6*Math.PI, Math.cos(TIME)-0.95);
        gScale(0.2,0.2,0.2);
        drawSphere() ;

        gTranslate(0,2*Math.cos(TIME*2)-0.6*Math.PI, -1*Math.cos(TIME)+0.95);
        gScale(5,5,5);


        gTranslate(0,0, -1.7*Math.cos(TIME)+1.75);
        gTranslate(0,0,-1.8);
        gScale(0.2,0.2,0.2);
        drawSphere() ;
    }
    gPop() ;
    gTranslate(-2.3,1,0);


    
    
    
    gPush() ;
    {

    //BODY
        gTranslate(0,-2.2,3);
        
        gRotate(90,0,1,0);
    
        gTranslate(3.9,0.5,0) ;
        gScale(0.7, 1, 0.3);
        setColor(vec4(0.5,0,0.6,1.0)) ;
        useTexture(6);
        
        drawCube() ;
        gScale(1/0.7, 1, 1/0.3);
        gTranslate(-3.9,-0.5,0) ;
        
        gTranslate(0, 2.2, -3);
        gRotate(2*Math.cos(TIME*2), 0, 1, 0);
        gTranslate(0,-2.2,3);
        //LEGS
    
        gTranslate(3.6,-1.30,0) ;
        gScale(0.17, 0.8, 0.2);
        setColor(vec4(0.0,0.0,0.5,1.0)) ;
        
        gTranslate(-3.6,1.33,0) ;
       // gRotate(Math.sin(4*TIME),10,20,10) ;
        gTranslate(3.6,-1.33,0) ;

        drawCube() ;  
        gTranslate(4,0,0) ;
        drawCube() ;

        gTranslate(3,0,0);
        gScale(1/0.17, 1/0.8, 1/0.2);
        gTranslate(-4.6,1.31,0) ;
        
        //elbow
        gTranslate(3.4,-2.15,0);
        gScale(0.2,0.15,0.2);

        drawSphere() ;
        gScale(5,1/0.15,5);
        gTranslate(0.7,0,0);
        gScale(0.2,0.15,0.2);
        drawSphere();

        gScale(5,1/0.15,5);
        gTranslate(-4.1,2.15,0);

       // gRotate(10,0,0,1);
        
        

        //legs2
        gTranslate(4.1,-2.9, 0) ;
        gScale(0.17, 0.7, 0.2);
      //  gRotate(TIME*180/3.14159,0,1,0) ;
        drawCube() ;
        gTranslate(-4,0,0) ;
      //  gRotate(TIME*180/3.14159,0,1,0) ;
        drawCube() ;
        gTranslate(4,0,0);
        gScale(1/0.17, 1/0.8, 1/0.2);
        gTranslate(-4.18,2.935,0.18) ;
        

    //FEET
    
        gTranslate(3.5,-3.8,0.1) ;
    //    gTranslate(7.5,-4,0) ;
        //gScale(0.18, 0.05, 0.7);
        gScale(0.2, 0.1, 0.4);
       // gRotate(70,0, 30, 40);
        setColor(vec4(0.2,0.2,0.2,1.0)) ;
       // gRotate(TIME*180/3.14159,0,1,0) ;
        drawCube() ;
        gScale(1/0.2, 1/0.1, 1/0.4);
        gTranslate(0.68,0,0) ;
        gScale(0.2, 0.1, 0.4);
        drawCube() ;
    }
    gPop() ;
    
    
   
    
    if( animFlag )
        window.requestAnimFrame(render);
}
