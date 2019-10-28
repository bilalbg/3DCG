
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
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var timeLastDraw = 0 ;
var timeDiff = 0 ;
var isVisible = false;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var prevTime = 0.0 ;
var resetTimerFlag = true ;
var animFlag = false ;
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
    

    setColor(materialDiffuse) ;

    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    
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

    
    document.getElementById("sliderXi").onchange = function() {
        RX = this.value ;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").onchange = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").onchange = function() {
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
        console.log(animFlag) ;
    };

    
    render();
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
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}



function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,10);
    MS = [] ; // Initialize modeling matrix stack
    
    modelMatrix = mat4() ;
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    
    
    setAllMatrices() ;
    
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
   
    //gTranslate(-4,0,0) ;
    //rocks?
    gPush() ;
    {
        gTranslate(0, -3.05, 0)
        setColor(vec4(0.25,0.25,0.25,1.0)) ;
        drawSphere() ;
        gTranslate(-1.4, -0.5, 0);
        gScale(0.5, 0.5, 0.5);
        drawSphere() ;
    }
    gPop() ;





    //head
    gPush() ;
    {
        gTranslate(0,1,0);
        gTranslate(Math.sin(2*TIME)/4, Math.sin(2*TIME)/4,0);
        gTranslate(3.8, 1.9, 0);
        gScale(0.4, 0.4, 0.4);
        setColor(vec4(0.5,0.3,0.6,1.0)) ;
        drawSphere() ;
        
        gScale(2.5,2.5,2.5);
        gTranslate(-3.8,-1.9,0);

        //BODY
    
        gTranslate(3.8,0.5,0) ;
        gScale(0.7, 1, 0.3);
        gRotate(10,0, -30, 0);
        setColor(vec4(0.5,0,0.6,1.0)) ;
        
        drawCube() ;
        gRotate(10,0, 30, 0);
        gScale(1/0.7, 1, 1/0.3);
        gTranslate(-3.8,-0.5,0) ;
   
        
		gRotate(4*Math.sin(TIME)+4,1,0,1) ;
        
        //LEGS
    
        gTranslate(3.6,-1.31,0) ;
        gScale(0.17, 0.8, 0.1);
        gRotate(30, 0, -30, 0);
        setColor(vec4(0.3,0.1,0.4,1.0)) ;
        
        gTranslate(-3.6,1.33,0) ;
       // gRotate(Math.sin(4*TIME),10,20,10) ;
        gTranslate(3.6,-1.33,0) ;

        drawCube() ;  
        gTranslate(4,0,0) ;
        drawCube() ;

        gTranslate(3,0,0);
        gRotate(30, 0, 30, 0);
        gScale(1/0.17, 1/0.8, 1/0.1);
        gTranslate(-4.6,1.31,0) ;


        gRotate(2*Math.sin(TIME)+2,1,0,1) ;
       //LEGS2
    
        gTranslate(4.12,-2.92,-0.18) ;
        gScale(0.17, 0.8, 0.1);
        gRotate(30,0, -30, 0);
        setColor(vec4(0.3,0.1,0.4,1.0)) ;
      //  gRotate(TIME*180/3.14159,0,1,0) ;
        drawCube() ;
        gTranslate(-4,0,0) ;
      //  gRotate(TIME*180/3.14159,0,1,0) ;
        drawCube() ;
        gTranslate(4,0,0);
        gRotate(30,0, 30, 0);
        gScale(1/0.17, 1/0.8, 1/0.1);
        gTranslate(-4.18,2.935,0.18) ;
        

    //FEET
    
        gTranslate(3.5,-3.8,-0.3) ;
    //    gTranslate(7.5,-4,0) ;
        //gScale(0.18, 0.05, 0.7);
        gRotate(40, 2,-2, 0);
        gScale(0.2, 0.05, 0.5);
       // gRotate(70,0, 30, 40);
        setColor(vec4(0.3,0.1,0.4,1.0)) ;
       // gRotate(TIME*180/3.14159,0,1,0) ;
        drawCube() ;
        gScale(1/0.2, 1/0.05, 1/0.5);
        gRotate(40, -2,2, 0);
        gTranslate(0.6,0,0) ;
        gRotate(40, 2,-2, 0);
        gScale(0.2, 0.05, 0.5);
        drawCube() ;
    }
    gPop() ;
  




    
    //fish
    gPush() ;
    {
        gScale(-1,1,1);
        gTranslate(0, Math.sin(2*TIME),0);
        gRotate(TIME*180/3.14159,0,181,0) ;

       gTranslate(2, -1.9, 0)

       //eye whites
        gTranslate(0, 0.5, 1.2);
        setColor(vec4(1,1,1,1.0)) ;
        gScale(0.2, 0.2, 0.2);
        drawSphere() ;
        gTranslate(0, 0, 4);
        drawSphere() ;

        gTranslate(0,-2.5,-2.2);
        gScale(5,5,5);


        //pupils


        gTranslate(0.1, 0.5, -0.35);
        gScale(0.13, 0.13, 0.13);
        setColor(vec4(0.25,0.25,0.25,1.0)) ;
        gTranslate(0,0,Math.sin(TIME)/4);
        drawSphere();
        gScale(1/0.13, 1/0.13, 1/0.13);
        gTranslate(0,0,0.8);
        gScale(0.13, 0.13, 0.13);
        drawSphere();
        gTranslate(0,0,0);

        gScale(1/0.13, 1/0.13, 1/0.13);
        gTranslate(-0.1,-0.5,-0.45);

        //head
        gRotate(-270,0,180,0)
        gScale(1, 0.8, 1.2)
        setColor(vec4(0.65,0.65,0.65,1.0)) ;
        drawCone() ;
       
        gScale(1, 1.25, 0.833);
        gRotate(-270, 0, 180, 0);

        //body
        gTranslate(2.35,0,0);
        
        gRotate(90, 0, 90, 0);
        gScale(1, 0.8, 3.5);
        gRotate(20,0,0,1);
        setColor(vec4(0.9,0.0,0.0,1.0)) ;
        drawCone();
       
        //reverse
        gScale(1,1.25,0.287356322);
        gRotate(20,0,0,-1);
        gRotate(180,0,-1,0);
        gRotate(90, 0, -90, 0);

        //fins
        gTranslate(-2.1,0.6,0);
        gRotate(90, -100, -90, 0);
        gScale(0.3, 0.3, 1.5);
        
        gTranslate(2.1, -0.6, 0);
        gRotate(40*Math.sin(2*TIME), 0,0,1);
        gTranslate(-2.1,0.6,0);

        drawCone();
        gScale(3, 3, 0.66);
        gRotate(90, 100, 90, 0);

        gTranslate(0.1, -1, 0.1);
        gRotate(90, 100, -90, 0);
        gScale(0.2, 0.2, 1);
        drawCone();

    }
    gPop() ;
    



 
   
    //seaweed mid
    gPush() ;
    {
        setColor(vec4(0.0,0.8,0.0,1.0)) ;
        gTranslate(0,-1.8,0) ;
        
        gScale(0.15,0.25,0.2);
        
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
    }
    gPop() ;
     //seaweed left
     gPush() ;
     {
         gTranslate(-0.7,-2.1,0) ;
         gScale(0.15,0.25,0.2);
         setColor(vec4(0.0,0.8,0.0,1.0)) ;
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
     }
     gPop() ;
     //seaweed right
     gPush() ;
     {
         gTranslate(0.7,-2.1,0) ;
         gScale(0.15,0.25,0.2);
         setColor(vec4(0,0.8,0,1.0)) ; 
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
        gTranslate(0,2,0);
        gTranslate(Math.sin(TIME*2),0,0);
        drawSphere();
     }
     gPop() ;
    
    





    //ground
    gPush() ;
    {
        gTranslate(-1, -6, -10) ;
        gScale(12, 2, 20);
        setColor(vec4(0.07,0.07,0.0,1.0)) ;
        //gRotate(TIME*180/3.14159,0,1,0) ;
        drawCube() ;
    }
    gPop() ;

    
	/*if( (TIME - timeLastDraw) > 3 && !isVisible) {
		isVisible = true ;
		timeLastDraw = TIME ;
	}
	
	if( (TIME - timeLastDraw > 2) && isVisible) {
		isVisible = false ;
	}
	if( isVisible){
		setColor(vec4(0.0,1.0,0.0,1.0)) ;
		gRotate(TIME*180/3.14159,0,1,0) ;
		drawCube() ;
    }*/ 
    
    gTranslate(3.5, 2.8, 1);
    gScale(0.1,0.1,0.1); 
    setColor(vec4(1,1.0,1.0,1.0)) ;
    gTranslate(3*Math.sin(2*TIME),20*TIME/3.14159,0)
    if( ((TIME - timeLastDraw) > 0 || (TIME-timeLastDraw )< 2) && !isVisible) {
		isVisible = true ;
		timeLastDraw = TIME ;
	}
	
	if( (TIME - timeLastDraw > 2) && isVisible) {
		isVisible = false ;
	}
    if( isVisible){
        drawSphere() ;
    }
   /*  //bubbles
     gPush();
     {  
         gTranslate(3.5, 2.8, 1);
         gScale(0.1,0.1,0.1); 
         setColor(vec4(1,1.0,1.0,1.0)) ;
         gTranslate(3*Math.sin(2*TIME),20*TIME/3.14159,0)
        // drawSphere();
        
        if( (timeDiff == 0 || timeDiff == 0.5 || timeDiff == 1 || timeDiff == 1.5) && !isVisible) {
            //isVisible = true ;
            drawSphere();
            timeLastDraw = TIME;
            timeDiff = TIME-timeLastDraw;
        }
        
        }
        gPop();*/
        if( animFlag )
            window.requestAnimFrame(render);
    }

