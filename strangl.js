/**
    StranGL (Strange Graphics Library) JS 3d graphics library. Depth buffer sorting is done by sorting centroids. Requires the createjs library.
    Integrates smoothly with Adobe Animate.
    
    Data types supported:
    Vertex
    Line
    Polygon
    
    In order to render any of these, call the `render()` function on the graphics context.
    eg:
        let myShape = new createjs.Shape();
        myVertex.render(myShape.graphics);
        
    Utility functions:
        centroidSort: A helper function to compare two of the above data types. Useful to register this with with an array sort function.
        eg:
            renderList.sort(strangl.centroidSort);
*/

if(this.createjs == null)
    throw "strangl requires createjs to run";

this.strangl = this.strangl||{};
(function(){
    "use strict";
    /** Vertex data structure:
        Constructor:
            Vertex(x,y,z,radius,strokecolor,style, fillcolor,name)
        Properties:
            x,y,z (Numbers): The Cartesian x, y, and z coords.
            radius (Number): The radius of the circle when rendered.
            strokecolor (String): The color of the circle's outline when rendered
            style (Number): Style of the circle when rendered
            fillcolor (String): The CSS color of the circle's interior when rendered.
            name (String): A string name of the vertex. (For debugging)
        Methods:
            // Transform:
            doOrtho(cubesize):
                Perform an orthographic transform on the Vertex. ie Objects do not diminish with depth.
                cubesize - the bounding size of the cube.
                Return: the transformed Vertex. Useful to chain calls.
            doPerspective(cubesize, focalLen):
                Perform a perspective tranfrom on the Vertex. ie Objects diminish with depth.
                cubesize - the bounding size of the cube.
                focalLen - the focal length (how far away the viewer is). Closer = more distorted
                Return: the transformed Vertex. Useful to chain calls.
            scale(factor):
                Multiply x, y, and z by a uniform amount.
                factor - the factor by which x, y, and z is multiplied.
                Return: transformed Vertex. Useful to chain calls.
            rotX(angle):
                Rotate the Vertex about the x axis
                anble - The angle in radians to rotate
                Returns: transformed Vertex. Useful to chain calls.
            rotY(angle):
                Rotate the Vertex about the y axis
                anble - The angle in radians to rotate
                Returns: transformed Vertex. Useful to chain calls.
            rotZ(angle):
                Rotate the Vertex about the z axis
                anble - The angle in radians to rotate
                Returns: transformed Vertex. Useful to chain calls.
            translate(x,y,z):
                Translate the Vertex <+x, +y, +z>
                x y and z: the x y and z amounts to transform the Vertex by.
                Returns: transformed Vertex. Useful to chain calls.
            // Render:
            render(ctx):
                Render the Vertex to the graphics context:
                ctx - the createjs.Graphics object to render to
                Returns: void
            // Misc:
            toString():
                Returns string "sglVertex". 
            getCentroidZ():
                Returns: Vertex's z coordinate. Use it to sort the z buffer by center of mass.
    */
    function Vertex(x,y,z,radius,strokecolor,style, fillcolor, name){
        this.x = x; this.y = y; this.z = z; this.name=name;
        this.radius=radius;
        this.strokecolor=strokecolor;
        this.style=style;
        this.fillcolor=fillcolor;
    }
    
    Vertex.prototype.copy = function() {
        return new Vertex(this.x, this.y, this.z, this.radius, this.strokecolor, this.style, this.fillcolor, this.name);
    };
    
    Vertex.prototype.toString = function() {return "sglVertex"};
    
    // Transform functions:
    Vertex.prototype.doOrtho = function(cubesize) {
        // Symmetric box
        this.x /= cubesize; this.y/=cubesize; this.z;
        
        return this;
    };
    
    Vertex.prototype.doPerspective = function(cubesize, focalLen) {
        let scale = focalLen / (focalLen + this.z) / cubesize;
        this.x = cubesize + this.x*scale; this.y = cubesize + this.y*scale; this.z = cubesize + this.z*scale;
        
        return this;
    };
    
    Vertex.prototype.scale = function(factor) {
        this.x *= factor; this.y *= factor; this.z *= factor;
        return this;
    };
    
    Vertex.prototype.rotX = function(angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        
        let y = c*this.y - s*this.z;
        let z = c*this.z + s*this.y;
        this.y = y;
        this.z = z;
        return this;
    };
    
    Vertex.prototype.rotY = function(angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        
        let x = c*this.x - s*this.z;
        let z = c*this.z + s*this.x;
        this.x = x;
        this.z = z;
        return this;
    };
    
    Vertex.prototype.rotZ = function(angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        
        x = c*this.x - s*this.y;
        y = c*this.y + s*this.x;
        this.x = x;
        this.y = y;
        return this;
    };
    
    Vertex.prototype.translate = function(x,y,z) {
        this.x+=x; this.y+=y; this.z+=z;
        return this;
    };
    
    // Render a circle here
    Vertex.prototype.render = function(ctx) {
        ctx.s(this.strokecolor).f(this.fillcolor).ss(this.style)
        .dc(this.x, this.y, this.radius).ef();
    };
    
    // Sorting
    Vertex.prototype.getCentroidZ = function(){return this.z};
    
    strangl.Vertex = Vertex; // Add to library
    
    /** Line data structure:
    Constructor:
        Line(a,b,color,style,name)
    Properties:
        start (Object): The starting point of the line
        end (Object): The ending point of the line
        // Graphics properties:
        color (String): The stroke color of the line
        style (Number): Line style. Consult createjs documentation for more info
        name(String): A string name for the Line
    Functions:
        // Transform:
        doOrtho(cubesize):
            Perform an orthographic transform on the Line.
            cubesize - the bounding size of the cube.
            Return: the transformed Line. Useful to chain calls.
        doPerspective(cubesize, focalLen):
            Perform a perspective tranfrom on the Line. ie Objects diminish with depth.
            cubesize - the bounding size of the cube.
            focalLen - the focal length (how far away the viewer is). Closer = more distorted
            Return: the transformed Line. Useful to chain calls.
        scale(factor):
            Multiply x, y, and z by a uniform amount.
            factor - the factor by which x, y, and z is multiplied.
            Return: transformed Line. Useful to chain calls.
        rotX(angle):
            Rotate the Line about the x axis
            anble - The angle in radians to rotate
            Returns: transformed Line. Useful to chain calls.
        rotY(angle):
            Rotate the Line about the y axis
            anble - The angle in radians to rotate
            Returns: transformed Line. Useful to chain calls.
        rotZ(angle):
            Rotate the Line about the z axis
            anble - The angle in radians to rotate
            Returns: transformed Line. Useful to chain calls.
        translate(x,y,z):
            Translate the Line <+x, +y, +z>
            x y and z: the x y and z amounts to transform the Line by.
            Returns: transformed Line. Useful to chain calls.
        // Render:
        render(ctx):
            Render the Line to the graphics context:
            ctx - the createjs.Graphics object to render to
            Returns: void
        // Misc:
        toString():
            Returns string "sglLine". 
        getCentroidZ():
            Returns: Line's z center of mass. Use it to sort the z buffer by center of mass.
    */
    function Line(a,b,color,style,name){
        this.start = new strangl.Vertex(a.x, a.y, a.z);
        this.end = new strangl.Vertex(b.x, b.y, b.z);
        this.name = name;
        this.color = color; this.style = style;
    }
    
    Line.prototype.copy = function() {
        return new Line(this.start, this.end, this.color, this.style, this.name);
    };
    
    Line.prototype.toString = function() {
        return "sglLine";
    };
    
    // Render the Line
    Line.prototype.render = function(ctx) {
        if(!(ctx instanceof createjs.Graphics))
            throw("Null graphics context");
        
        ctx.s(this.color).ss(this.style)
        .mt(this.start.x, this.start.y)
        .lt(this.end.x, this.end.y).es();
    };
    
    // Transform functions:
    Line.prototype.doOrtho = function(cubesize) {
        this.start.doOrtho(cubesize);
        this.end.doOrtho(cubesize);
        
        return this;
    };
    
    Line.prototype.doPerspective = function(cubesize, focalLen) {
        this.start.doPerspective(cubesize, focalLen);
        this.end.doPerspective(cubesize, focalLen);
        return this;
    };
    
    Line.prototype.scale = function(factor) {
        this.start.scale(factor);
        this.end.scale(factor);
        return this;
    };
    
    Line.prototype.rotX = function(angle) {
        this.start.rotX(angle);
        this.end.rotX(angle);
        return this;
    };
    
    Line.prototype.rotY = function(angle) {
        this.start.rotY(angle);
        this.end.rotY(angle);
        return this;
    };
    
    Line.prototype.rotZ = function(angle) {
        this.start.rotZ(angle);
        this.end.rotZ(angle);
        return this;
    };
    
    Line.prototype.translate = function(x,y,z) {
        this.start.translate(x,y,z);
        this.end.translate(x,y,z);
        return this;
    };
    
    // Sorting
    Line.prototype.getCentroidZ = function() {
        return (this.start.z + this.end.z)/2;
    };
    
    strangl.Line = Line; // Add to sgl
    
    /** Polygon data structure
        Constructor:
            Polygon(vertices,strokecolor,style,colorRGBA,name)
        Properties:
            vertices (Array): An array of Vertex data.
            // Graphics:
            strokecolor (String): The color of the Polygon's outline when rendered.
            style (Number): Stroke style. Consult createjs docs.
            fillcolor (Array): The color that the polygon is filled with. Order: r,g,b (0-255) and alpha (0-1);
            polyAttribs (Object): Object that sets material properties of the polygon. Currently used:
                reflDiffuse [=1]
                renderWire [=false]
        Functions:
        // Transform:
        doOrtho(cubesize):
            Perform an orthographic transform on the Line.
            cubesize - the bounding size of the cube.
            Return: the transformed Poly. Useful to chain calls.
        doPerspective(cubesize, focalLen):
            Perform a perspective tranfrom on the Poly. ie Objects diminish with depth.
            cubesize - the bounding size of the cube.
            focalLen - the focal length (how far away the viewer is). Closer = more distorted
            Return: the transformed Poly. Useful to chain calls.
        applyLights():
            Color transform for each of the light sources. Modifies fillcolor.
            Returns: void.
        addLightSource(source):
            Attach a light source (sglLightSource) to the polygon.
            Returns: void
xxx        lightDiffuse (source):
xxx            Transform the current color with respect to an sglLightSource.
xxx            Returns: void
xxx        lightAmbient(source):
xxx            Add ambient light to a polygon.
        scale(factor):
            Multiply x, y, and z by a uniform amount.
            factor - the factor by which x, y, and z is multiplied.
            Return: transformed Poly. Useful to chain calls.
        rotX(angle):
            Rotate the Poly about the x axis
            anble - The angle in radians to rotate
            Returns: transformed Poly. Useful to chain calls.
        rotY(angle):
            Rotate the Poly about the y axis
            anble - The angle in radians to rotate
            Returns: transformed Poly. Useful to chain calls.
        rotZ(angle):
            Rotate the Poly about the z axis
            anble - The angle in radians to rotate
            Returns: transformed Poly. Useful to chain calls.
        translate(x,y,z):
            Translate the Poly <+x, +y, +z>
            x y and z: the x y and z amounts to transform the Poly by.
            Returns: transformed Poly. Useful to chain calls.
        // Render:
        render(ctx):
            Render the Poly to the graphics context:
            ctx - the createjs.Graphics object to render to
            Returns: void
        // Misc:
        setPolyAttrib(k,v):
            Set the attribute k to value v.
        getsurfaceNormal():
            Calculates vector of surface normal corresponding to [x,y,z] for the Poly.
            Returns Float64Array with properties magnitude and unitVector;
                magnitude
                    Magnitude of surface norm
                unitVector:
                    Unit normal (magnitude 1). Returns Float64Array.
        shouldRender():
            Return whether the face is a back face. Recommends whether or not to render. (Returns Boolean)
        toString():
            Returns string "sglPoly". 
        getCentroidZ():
            Returns: Poly's z center of mass. Use it to sort the z buffer by center of mass.
        getCentroid():
            Returns: Center of mass x y and z in Float64Array(3). Use it to help with the light vector.
    */
    function Polygon(vertices, strokecolor, style, colorRGBA, props, name){
        if(vertices[0] == null)
            throw("Need an Array or something indexable.");
        this.Vlist = new Array(vertices.length);
        for(let i=0, len=vertices.length; i<len; i++){
            this.Vlist[i] = new Vertex(vertices[i].x, vertices[i].y, vertices[i].z);
        }
        this.name = name;
        this.strokecolor = strokecolor;
        this.style = style;
        if(colorRGBA != null){
            if(colorRGBA[0] > 255)  colorRGBA[0] = 255;
            if(colorRGBA[1] > 255)  colorRGBA[1] = 255;
            if(colorRGBA[2] > 255)  colorRGBA[2] = 255;
            if(colorRGBA[3] > 1)    colorRGBA[3] = 1;
            if(colorRGBA[0] < 0)    colorRGBA[0] = 0;
            if(colorRGBA[1] < 0)    colorRGBA[1] = 0;
            if(colorRGBA[2] < 0)    colorRGBA[2] = 0;
            if(colorRGBA[3] < 0)    colorRGBA[3] = 0;
            this.fillcolor = [colorRGBA[0],colorRGBA[1],colorRGBA[2],colorRGBA[3]];
        } else {
            this.fillcolor = null;
        }
        this.polyAttribs = (props==null)? {
                                reflDiffuse: 1,
                                reflAmbient: 1,
                                lights: [],
                                renderWire: false 
                            }:JSON.parse(JSON.stringify(props));
    }
    
    Polygon.prototype.copy = function() {
        return new Polygon(this.Vlist, this.strokecolor, this.style, this.fillcolor, this.polyAttribs, this.name);
    };
    
    Polygon.prototype.setPolyAttrib = function(k,v) {
        this.polyAttribs[k] = v;
        return this;
    };
    
    Polygon.prototype.toString = function() {
        return "sglPoly";
    };
    
    Polygon.prototype.shouldRender = function() {
        return this.getsurfaceNormal()[2] < 0;
    };
    
    // Render Polygons:
    Polygon.prototype.render = function(ctx) {
        if(!(ctx instanceof createjs.Graphics))
            throw("Null graphics context.");
        
        // Do not render polygon if surface normal faces away from viewer.
        if(!this.shouldRender() || this.fillcolor == null)
            return;
        
        if(this.fillcolor[3]==null)
            this.fillcolor[3]=1;
        
        let stringFillc = createjs.Graphics.getRGB(this.fillcolor[0], this.fillcolor[1], this.fillcolor[2], this.fillcolor[3]);
        
        let stringStroke = (this.polyAttribs.renderWire)?this.strokecolor:stringFillc;
        
        ctx.s(stringStroke)
        .ss(this.style,0,0,0,true)
        .f(stringFillc)
        .mt(this.Vlist[0].x, this.Vlist[0].y);
        for(let i=1, len=this.Vlist.length; i<len; i++){
            ctx.lt(this.Vlist[i].x, this.Vlist[i].y);
        }
        ctx.cp().ef().es();
    };
    
    // Transform functions:
    Polygon.prototype.doOrtho = function(cubesize) {
        for(let i=0, len=this.Vlist.length; i<len; i++){
            this.Vlist[i].doOrtho(cubesize);
        }
        return this;
    };
    
    Polygon.prototype.doPerspective = function(cubesize, focalLen) {
        for(let i=0, len=this.Vlist.length; i<len; i++){
            this.Vlist[i].doPerspective(cubesize, focalLen);
        }
        return this;
    };
    
    Polygon.prototype.scale = function(factor) {
        for(let i=0, len=this.Vlist.length; i<len; i++){
            this.Vlist[i].scale(factor);
        }
        return this;
    };
    
    Polygon.prototype.rotX = function(angle) {
        for(let i=0, len=this.Vlist.length; i<len; i++){
            this.Vlist[i].rotX(angle);
        }
        return this;
    };
    
    Polygon.prototype.rotY = function(angle) {
        for(let i=0, len=this.Vlist.length; i<len; i++){
            this.Vlist[i].rotY(angle);
        }
        return this;
    };
    
    Polygon.prototype.rotZ = function(angle) {
        for(let i=0, len=this.Vlist.length; i<len; i++){
            this.Vlist[i].rotZ(angle);
        }
        return this;
    };
    
    Polygon.prototype.translate = function(x,y,z) {
        for(let i=0, len=this.Vlist.length; i<len; i++){
            this.Vlist[i].translate(x,y,z);
        }
        return this;
    };
    
    // Lighting
    Polygon.prototype.addLightSource = function(lightsrc) {
        if(!(lightsrc instanceof LightSource))
            throw "Expected LightSource";
        this.polyAttribs.lights.push(lightsrc);
        
        return this;
    };
    
    Polygon.prototype.applyLights = function() {
        let lights = this.polyAttribs.lights;
        let effects = [];
        for(let i=0, len=lights.length; i<len; i++){
            if(lights[i].type == "DIFFUSE"){
                let dif = lightDiffuse.call(this, lights[i]);
                effects.push(dif);
            } else if(lights[i].type == "AMBIENT"){
                let amb = lightAmbient.call(this, lights[i]);
            } else
                throw "Lighting type not defined.";
        }
        this.fillcolor = [0,0,0,0];
        for(let i=0, len=effects.length; i<len; i++){
            this.fillcolor[0] += effects[i][0];
            this.fillcolor[1] += effects[i][1];
            this.fillcolor[2] += effects[i][2];
            this.fillcolor[3] += effects[i][3];
        }
        return this;
    };
    
    // Private functions:
    let lightDiffuse = function(lightsrc){
        if(!(lightsrc instanceof LightSource))
            throw "Expected LightSource";
        let factorsRGBA = [ this.polyAttribs.reflDiffuse*lightsrc.lightVec[0],
                            this.polyAttribs.reflDiffuse*lightsrc.lightVec[1],
                            this.polyAttribs.reflDiffuse*lightsrc.lightVec[2],
                            this.polyAttribs.reflDiffuse*lightsrc.lightVec[3]];
        let centroid = this.getCentroid();
        let lightvector = new Float64Array(3);
        lightvector[0] = lightsrc.x-centroid[0];
        lightvector[1] = lightsrc.y-centroid[1];
        lightvector[2] = lightsrc.z-centroid[2];
        let mag = Math.sqrt(lightvector[0]*lightvector[0] + lightvector[1]*lightvector[1] + lightvector[2]*lightvector[2]);
        lightvector[0] /= mag;
        lightvector[1] /= mag;
        lightvector[2] /= mag;
        let unitsurface = this.getUnitVector();
        let dotproduct = lightvector[0]*unitsurface[0] + lightvector[1]*unitsurface[1] + lightvector[2]*unitsurface[2];
        let I_diff = [  factorsRGBA[0] * dotproduct,
                        factorsRGBA[1] * dotproduct,
                        factorsRGBA[2] * dotproduct];
        if(I_diff < 0) I_diff[0] = 0;
        if(I_diff < 0) I_diff[1] = 0;
        if(I_diff < 0) I_diff[2] = 0;
        if(I_diff > 1) I_diff[0] = 1;
        if(I_diff > 1) I_diff[1] = 1;
        if(I_diff > 1) I_diff[2] = 1;
        
        let retFill = new Int32Array(4);
        retFill[0] = (this.fillcolor[0] * I_diff[0]) | 0;
        retFill[1] = (this.fillcolor[1] * I_diff[1]) | 0;
        retFill[2] = (this.fillcolor[2] * I_diff[2]) | 0;
        retFill[3] *= lightsrc.lightVec[3];
        
        if(retFill[0] > 255)  retFill[0] = 255;
        if(retFill[1] > 255)  retFill[1] = 255;
        if(retFill[2] > 255)  retFill[2] = 255;
        if(retFill[3] > 1)    retFill[3] = 1;
        if(retFill[0] < 0)    retFill[0] = 0;
        if(retFill[1] < 0)    retFill[1] = 0;
        if(retFill[2] < 0)    retFill[2] = 0;
        if(retFill[3] < 0)    retFill[3] = 0;
        
        return retFill;
    };
    
    let lightAmbient = function(lightsrc){
        let retFill = new Int32Array(4);
        retFill[0] = (this.fillcolor[0] * lightsrc.lightVec[0]) | 0;
        retFill[1] = (this.fillcolor[1] * lightsrc.lightVec[1]) | 0;
        retFill[2] = (this.fillcolor[2] * lightsrc.lightVec[2]) | 0;
        retFill[3] = (this.fillcolor[3] * lightsrc.lightVec[3]) | 0;
        
        if(retFill[0] > 255)  retFill[0] = 255;
        if(retFill[1] > 255)  retFill[1] = 255;
        if(retFill[2] > 255)  retFill[2] = 255;
        if(retFill[3] > 1)    retFill[3] = 1;
        if(retFill[0] < 0)    retFill[0] = 0;
        if(retFill[1] < 0)    retFill[1] = 0;
        if(retFill[2] < 0)    retFill[2] = 0;
        if(retFill[3] < 0)    retFill[3] = 0;
        
        return retFill;
    };
    
    // Misc
    Polygon.prototype.getCentroidZ = function() {
        let acc = 0;
        for(let i=0, len=this.Vlist.length; i<len; i++){
            acc += this.Vlist[i].z;
        }
        acc /= this.Vlist.length;
        return acc;
    };
    
    Polygon.prototype.getCentroid = function() {
        let acc = new Float64Array(3);
        let vertices = this.Vlist.length;
        for(let i=0; i<vertices; i++){
            acc[0]+=this.Vlist[i].x;
            acc[1]+=this.Vlist[i].y;
            acc[2]+=this.Vlist[i].z;
        }
        acc[0]/=vertices;
        acc[1]/=vertices;
        acc[2]/=vertices;
        return acc;
    };
    
    Polygon.prototype.getsurfaceNormal = function() {
        let normal = new Float64Array(3);
        let p = this.Vlist;
        for(let i=0, len=p.length; i<len; i++){
            let j=(i+1)%len;
            normal[0] += (p[i].y-p[j].y)*(p[i].z+p[j].z);
            normal[1] += (p[i].z-p[j].z)*(p[i].z+p[j].z);
            normal[2] += (p[i].x-p[j].x)*(p[i].y+p[j].y);
        }
        normal.magnitude = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
        
        normal.unitVector = new Float64Array(3);
        normal.unitVector[0] = normal[0]/normal.magnitude;
        normal.unitVector[1] = normal[1]/normal.magnitude;
        normal.unitVector[2] = normal[2]/normal.magnitude;
        
        return normal;
    };
    
    strangl.Polygon = Polygon;
    
    /** Lighting: a simple light source implementation. Diffuse is a point source that radiates in all directions, ambient is all around.
        The lighting vector is calculated, then dot-producted with the surface normal to get the lighting for that surface.
        // Constructor:
            LightSource(vertex, lRed, lGreen, lBlue, lAlpha)
        // Properties:
            x,y,z (Number): Coords that indicate the light source's position
            lightVec (Float64Array): Size 4. Light power for r, g, b, and alpha. Scale of 0 to 1.
            type (String): "DIFFUSE" or "AMBIENT"
        // Misc:
            toString():
                Returns the stirng "sglLightSource".
    */
    function LightSource(type, lRed, lGreen, lBlue, lAlpha, vertex){
        this.lightVec = new Float64Array(4); //rgba
        if(lRed < 0)    this.lightVec[0] = 0;
        if(lGreen < 0)  this.lightVec[1] = 0;
        if(lBlue < 0)   this.lightVec[2] = 0;
        if(lAlpha < 0)  this.lightVec[3] = 0;
        if(lRed > 1)    this.lightVec[0] = 1;
        if(lGreen > 1)  this.lightVec[1] = 1;
        if(lBlue > 1)   this.lightVec[2] = 1;
        if(lAlpha > 1)  this.lightVec[3] = 1;
        this.lightVec[0] = lRed;
        this.lightVec[1] = lGreen;
        this.lightVec[2] = lBlue;
        this.lightVec[3] = lAlpha;
        
        if(type==null){
            this.type = "DIFFUSE";
        } else if(type == "AMBIENT" || type=="DIFFUSE"){
            this.type = type;
        } else{
            throw "Lighting type not defined";
        }
        
        this.x = vertex.x; this.y = vertex.y; this.z = vertex.z;
    }
    
    LightSource.prototype.toString = function(){return "sglLightSource"};
    
    strangl.LightSource = LightSource;
    
    /** Utility functions:
        centroidSort sorts on render object's centroid. Easy to implement, but not super robust.
    */
    strangl.centroidSort = function(a,b){
        return (b.getCentroidZ() - a.getCentroidZ());
    };
})();
