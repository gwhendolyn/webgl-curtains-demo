import {Curtains, Plane, Vec2, RenderTarget, ShaderPass, TextureLoader, Vec3} from "curtainsjs";

function writeText(plane, canvas, curtains){
    const htmlPlane = plane.htmlElement;
    const htmlPlaneStyle = window.getComputedStyle(htmlPlane);

    const planeBoundingRect = plane.getBoundingRect();

    const htmlPlaneWidth = planeBoundingRect.width / curtains.pixelRatio;
    const htmlPlaneHeight = planeBoundingRect.height /curtains.pixelRatio;

    canvas.width = htmlPlaneWidth;
    canvas.height = htmlPlaneHeight;
    const context = canvas.getContext("2d");

    context.width = htmlPlaneWidth;
    context.height = htmlPlaneHeight;

    context.fillStyle = htmlPlaneStyle.color;
    context.font = htmlPlaneStyle.fontSize + " " + htmlPlaneStyle.fontFamily;
    context.fontStyle = htmlPlaneStyle.fontStyle;
    context.textAlign = htmlPlaneStyle.textAlign;

    context.textBaseline = "middle";
    context.fillText(htmlPlane.innerText, 0, htmlPlaneHeight / 1.8);

    if(plane.textures.length > 0) {
        plane.textures[0].resize();
        plane.textures[0].needUpdate();
    }
}

window.addEventListener("load", () => {
    const curtainCanvas = document.getElementById("canvas");
    const curtains = new Curtains({
        container: "canvas",
        watchScroll: true,
    });

    
    const loader = new TextureLoader(curtains);
    const asciiSprites = new Image();
    asciiSprites.crossOrigin = "anonymous";
    asciiSprites.src = "../images/charSprites.png";

    
    //#region --setup fractal noise backgrounds--
    const fractalBgs = document.getElementsByClassName("fractalBg");
    
    for (const fractalBg of fractalBgs){
        var res = new Vec2(fractalBg.offsetWidth,fractalBg.offsetHeight);
        var mouse = new Vec2(0.0,0.0);

        const params = {
            uniforms:{
                time:{
                    name: "u_time",
                    type: "1f",
                    value: 0.0,
                },
                resolution:{
                    name: "u_resolution",
                    type: "2f",
                    value: res,
                },
                mouse:{
                    name: "u_mouse",
                    type: "2f",
                    value: mouse,
                }
            },
        };

        const bgPlane = new Plane(curtains, fractalBg, params);
        bgPlane.onRender(() => {
            bgPlane.uniforms.time.value += 0.01;
        });
        fractalBg.addEventListener("mousemove", (event) => {
            var rect = fractalBg.getBoundingClientRect();
            bgPlane.uniforms.mouse.value.x = curtains.lerp(bgPlane.uniforms.mouse.value.x,event.clientX - rect.left,0.1);
            bgPlane.uniforms.mouse.value.y = curtains.lerp(bgPlane.uniforms.mouse.value.y,event.clientY - rect.top,0.1);
        });
        bgPlane.onAfterResize(() => {
            bgPlane.uniforms.resolution.value.x = fractalBg.offsetWidth;
            bgPlane.uniforms.resolution.value.y = fractalBg.offsetHeight;
        });
    };
    //#endregion

    //#region --ascii stuff--
    const asciiTarget = new RenderTarget(curtains);
    const asciiBg = document.getElementsByClassName("asciiBg")[0];
    const asciiText = document.getElementsByClassName("asciiText");
    const asciiLinks = document.getElementsByClassName("asciiLinks");
    const asciiBgPlane = new Plane(curtains, asciiBg,{
        renderOrder:0,
    });
    asciiBgPlane.onReady(()=>{asciiBgPlane.playVideos();});
    for(let i = 0; i < asciiText.length; i++){
        const asciiTextPlane = new Plane(curtains, asciiText[i], {
            renderOrder:1,
            uniforms:{
                time:{
                    name: "u_time",
                    type: "1f",
                    value: 0.0
                }
            }
        });

        const asciiTextTextureCanvas = document.createElement("canvas");
        asciiTextTextureCanvas.setAttribute("data-sampler", "planeTexture");
        asciiTextPlane.loadCanvas(asciiTextTextureCanvas);
        asciiTextPlane.onLoading((texture)=>{
            texture.shouldUpdate = false;

            writeText(asciiTextPlane, asciiTextTextureCanvas, curtains);
        });
        asciiTextPlane.setRenderTarget(asciiTarget);
        asciiTextPlane.onRender(() => {asciiTextPlane.uniforms.time.value += 0.01});
    }

    for(let i = 0; i < asciiLinks.length; i++){
        const asciiLinkPlane = new Plane(curtains, asciiLinks[i], {
            renderOrder:1,
            widthSegments:10,
            uniforms:{
                time:{
                    name: "u_time",
                    type: "1f",
                    value: 0.0
                },
                mouseover:{
                    name: "u_mouseover",
                    type: "1i",
                    value: 0
                }
            }
        });

        const asciiLinkTextureCanvas = document.createElement("canvas");
        asciiLinkTextureCanvas.setAttribute("data-sampler", "planeTexture");
        asciiLinkPlane.loadCanvas(asciiLinkTextureCanvas);
        asciiLinkPlane.onLoading((texture)=>{
            texture.shouldUpdate = false;

            writeText(asciiLinkPlane, asciiLinkTextureCanvas, curtains);
        });
        asciiLinkPlane.setRenderTarget(asciiTarget);
        asciiLinkPlane.onRender(() => {asciiLinkPlane.uniforms.time.value += 0.01});
        asciiLinks[i].addEventListener("mouseover", (event) => {asciiLinkPlane.uniforms.mouseover.value = 1;});
        asciiLinks[i].addEventListener("mouseout",  (event) => {asciiLinkPlane.uniforms.mouseover.value = 0;});
    }
    
    
    var asciiRes = new Vec2(curtainCanvas.offsetWidth,curtainCanvas.offsetHeight);
    
    
    asciiBgPlane.setRenderTarget(asciiTarget);

    const asciiPassParams = {
        vertexShaderID: "ascii-vs",
        fragmentShaderID: "ascii-fs",
        renderTarget: asciiTarget,
        renderOrder: 1,
        uniforms:{
            resolution:{
                name: "uRes",
                type: "2f",
                value: asciiRes
            },
        },
    }
    
    const asciiPass = new ShaderPass(curtains, asciiPassParams);
    loader.loadImage(asciiSprites, {
        sampler: "charSpriteSheet"
    }, (texture) => {
        asciiPass.addTexture(texture);
    }, (image, error) => {
        console.log("oops");
    });
    
    //#endregion

    const lightVector = new Vec3(1.0,1.0,1.0);
    

    //frame buffer to accept our tile ambient and diffuse render and html content
    const waterFB1 = new RenderTarget(curtains);
    
    //getting element and setting params for tile ambient and diffuse render
    const tileAD = document.getElementsByClassName("tileAD")[0];
    const tileRes = new Vec2(tileAD.offsetWidth, tileAD.offsetHeight);
    const tileADParams = {
        renderOrder: 0,
        uniforms:{
            light:{
                name: "uLight",
                type: "3f",
                value: lightVector
            },
            resolution:{
                name: "uRes",
                type: "2f",
                value: tileRes
            }
        }
    }
    //creating AD plane and adding it to fb1
    const tileADPlane = new Plane(curtains, tileAD, tileADParams);
    tileADPlane.setRenderTarget(waterFB1);
    
    //frame buffer to accept our water surface normals
    const waterFB2 = new RenderTarget(curtains);
    //getting element and setting params for water normals
    const waterNorm = document.getElementsByClassName("waterNormals")[0];
    const waterNormParams = {
        renderOrder:0,
        widthSegments: 200,
        heightSegments: 200,
        uniforms:{
            time:{
                name: "uTime",
                type: "1f",
                value: 0.0
            },
        }
    }

    //creating water normals plane and adding it to fb2
    const waterNormPlane = new Plane(curtains, waterNorm, waterNormParams);
    waterNormPlane.setRenderTarget(waterFB2);
    //updating water normal uniforms
    waterNormPlane.onRender(() => {waterNormPlane.uniforms.time.value++;});

    //frame buffer to accept tile render with water caustics
    const waterFB3 = new RenderTarget(curtains);
    //getting water caustics container and setting params
    var ratio = new Vec2(tileRes.x/curtainCanvas.offsetWidth,tileRes.y/curtainCanvas.offsetHeight);
    const waterCaustic = document.getElementsByClassName("waterCaustics")[0];
    const waterCausticParams = {
        renderOrder:1,
        uniforms:{
            ratio:{
                name: "uRatio",
                type: "2f",
                value: ratio
            }
        }
    }
    
    //creating water caustics plane, giving it fb1 and fb2 and rendering out to fb3
    const waterCausticPlane = new Plane(curtains, waterCaustic, waterCausticParams);
    waterCausticPlane.setRenderTarget(waterFB3);
    waterCausticPlane.onReady(() => {
        waterCausticPlane.createTexture({
            sampler: "uTileAD",
            fromTexture: waterFB1.getTexture(),
        });
        waterCausticPlane.createTexture({
            sampler: "uWaterNormals",
            fromTexture: waterFB2.getTexture(),
        });
    });

    //getting water refraction container and setting params
    const waterRefract = document.getElementsByClassName("waterRefraction")[0];
    const waterRefractParams = {
        renderOrder:2,
        uniforms:{
            ratio:{
                name: "uRatio",
                type: "2f",
                value: ratio
            },
            light:{
                name: "uLight",
                type: "3f",
                value: lightVector
            }
        }
    }

    //creating water refraction plane and rendering to screen
    const waterRefractPlane = new Plane(curtains, waterRefract, waterRefractParams);
    waterRefractPlane.onReady(() => {
        waterRefractPlane.createTexture({
            sampler: "uWaterCaustics",
            fromTexture: waterFB3.getTexture(),
        });
        waterRefractPlane.createTexture({
            sampler: "uWaterNormals",
            fromTexture: waterFB2.getTexture(),
        });
    });

    window.addEventListener("resize", () => {
        asciiPass.uniforms.resolution.value.x = curtainCanvas.offsetWidth;
        asciiPass.uniforms.resolution.value.y = curtainCanvas.offsetHeight;
        waterCausticPlane.uniforms.ratio.value.x = tileAD.offsetWidth/curtainCanvas.offsetWidth;
        waterCausticPlane.uniforms.ratio.value.y = tileAD.offsetHeight/curtainCanvas.offsetHeight;
        waterRefractPlane.uniforms.ratio.value.x = tileAD.offsetWidth/curtainCanvas.offsetWidth;
        waterRefractPlane.uniforms.ratio.value.y = tileAD.offsetHeight/curtainCanvas.offsetHeight;

    });
});