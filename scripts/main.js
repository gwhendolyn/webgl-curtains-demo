import {Curtains, Plane, TextureLoader, RenderTarget, ShaderPass, Vec2, Vec3, FXAAPass} from "curtainsjs";

//writes text into a canvas and applies the canvas as a texture to a plane
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
    const middleAlign = htmlPlaneStyle.textAlign == "center";

    context.textBaseline = "middle";
    
    context.fillText(htmlPlane.innerText, middleAlign ? htmlPlaneWidth/2 : 0, htmlPlaneHeight/2);

    if(plane.textures.length > 0) {
        plane.textures[0].resize();
        plane.textures[0].needUpdate();
    }
}

window.addEventListener("load", () => {

    //setup curtains and our texture loader
    const curtainCanvas = document.getElementById("canvas");
    const curtains = new Curtains({
        container: "canvas",
    });
    const loader = new TextureLoader(curtains);

    //load ascii sprite sheet for post processing demo
    const asciiSprites = new Image();
    asciiSprites.crossOrigin = "";
    asciiSprites.src = "./images/charSprites.png";

    
    //#region --fractal noise backgrounds--
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
            bgPlane.uniforms.time.value += 0.03;
        });
        fractalBg.addEventListener("mousemove", (event) => {
            var rect = fractalBg.getBoundingClientRect();
            bgPlane.uniforms.mouse.value.x = curtains.lerp(bgPlane.uniforms.mouse.value.x,event.clientX - rect.left,0.3);
            bgPlane.uniforms.mouse.value.y = curtains.lerp(bgPlane.uniforms.mouse.value.y,event.clientY - rect.top,0.3);
        });
        bgPlane.onAfterResize(() => {
            bgPlane.uniforms.resolution.value.x = fractalBg.offsetWidth;
            bgPlane.uniforms.resolution.value.y = fractalBg.offsetHeight;
        });
    };
    //#endregion
    
    //#region --3d demo--
    const a3dDemo = document.getElementsByClassName("a3dDemo")[0];
    const demoParams = {
        widthSegments: 20,
        heightSegments: 20,
        cullFace: "none",
        uniforms:{
            time:{
                name: "uTime",
                type: "1f",
                value: 0.0
            }
        }
    };
    const demoPlane = new Plane(curtains, a3dDemo, demoParams);
    demoPlane.onReady(() => {
        demoPlane.rotation.x = - Math.PI / 4.0;
    });
    demoPlane.onRender(() => {
        demoPlane.uniforms.time.value++;
        demoPlane.rotation.y += Math.PI / 1000;
        demoPlane.rotation.z += Math.PI / 1000;
    });
    //#endregion

    //#region --curtain--
    const curt = document.getElementsByClassName("curtain")[0];
    const curtParams ={
        widthSegments:20,
        heightSegments:10,
        uniforms:{
            time:{
                name: "uTime",
                type: "1f",
                value: 0.0
            }
        }
    };
    const curtPlane = new Plane(curtains, curt, curtParams);
    const curtTextureCanvas = document.createElement("canvas");
    curtTextureCanvas.setAttribute("data-sampler", "planeTexture");
    curtPlane.loadCanvas(curtTextureCanvas);
    curtPlane.onLoading((texture)=>{
        texture.shouldUpdate = false;

        writeText(curtPlane, curtTextureCanvas, curtains);
    });
    
    curtPlane.onRender(() => {curtPlane.uniforms.time.value++;});
    //#endregion

    //#region --ascii post processing demo--
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
        asciiTextPlane.onRender(() => {asciiTextPlane.uniforms.time.value += 0.05});
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
        asciiLinkPlane.onRender(() => {asciiLinkPlane.uniforms.time.value += 0.03});
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
    
    //#region --water demo--
    const lightVector = new Vec3(0.0,-1.5,0.8);
    const caustics = document.getElementsByClassName("caustics")[0];
    const causticParams = {
        renderOrder:1,
        uniforms:{
            time:{
                name: "uTime",
                type: "1f",
                value: 0.0
            }
        }
    }
    const causticPlane = new Plane(curtains, caustics, causticParams);
    causticPlane.onRender(() => {causticPlane.uniforms.time.value++;});

    const water = document.getElementsByClassName("water")[0];
    const container = document.getElementById("big");
    const waterParams = {
        renderOrder:2,
        widthSegments:200,
        heightSegments:200,
        cullFace:"none",
        uniforms:{
            time:{
                name: "uTime",
                type: "1f",
                value: 0.0
            },
            light:{
                name: "uLight",
                type: "3f",
                value: lightVector
            }
        }
    }

    const waterPlane = new Plane(curtains, water, waterParams);
    waterPlane.onReady(() => {waterPlane.rotation.x = -Math.PI /2.4;
        waterPlane.scale.x = 1.8;
        waterPlane.scale.y = 1.2;
    });
    var mouseXY = [0.0,0.0];
    var mouseHome = [0.0,0.0];
    container.addEventListener("mousemove", (event) => {
        waterPlane.uniforms.light.value.x = -((event.clientX/water.offsetWidth)-0.5);
        mouseXY[0] = event.clientX;
        mouseXY[1] = event.clientY;
    });
    waterPlane.onRender(() => {waterPlane.uniforms.time.value+=1;});
    //#endregion

    //#region --water buttons--
    const wigglers = document.getElementsByClassName("mouseoverWiggle");
    const wigglerParams = {
        widthSegments:20,
        heightSegments:20,
        uniforms:{
            time:{
                name: "uTime",
                type: "1f",
                value: 0.0
            },
            drag:{
                name: "uDrag",
                type: "2f",
                value: new Vec2(0.0,0.0)
            }
        }
    }
    var wigglerPlanes = [];
    for (const wiggler of wigglers){
        const wigglerPlane = new Plane(curtains, wiggler, wigglerParams);
        wigglerPlanes.push(wigglerPlane);
        wigglerPlane.onReady(() => {
            wigglerPlane.userData.mouseOver = false;
            wigglerPlane.userData.beingDragged = false;
            wiggler.addEventListener("mouseover", () => {
                wigglerPlane.userData.mouseOver = true;
            });

            wiggler.addEventListener("mouseout", () => {
                wigglerPlane.userData.mouseOver = false;
            });

            wiggler.addEventListener("mousedown", (event) => {
                wigglerPlane.userData.beingDragged = true;
                mouseHome = [event.clientX, event.clientY];
            });

        }).onRender(() => {
            if(wigglerPlane.userData.beingDragged){
                wigglerPlane.uniforms.drag.value.x = -(mouseXY[0] - mouseHome[0]);
                wigglerPlane.uniforms.drag.value.y = -(mouseXY[1] - mouseHome[1]);
                wigglerPlane.relativeTranslation.x = mouseXY[0] - mouseHome[0]; 
                wigglerPlane.relativeTranslation.y = mouseXY[1] - mouseHome[1];
            }else{
                wigglerPlane.relativeTranslation.x += (0 - wigglerPlane.relativeTranslation.x) * 0.08;
                wigglerPlane.relativeTranslation.y += (0 - wigglerPlane.relativeTranslation.y) * 0.08;
                wigglerPlane.uniforms.drag.value.x += (0 - wigglerPlane.uniforms.drag.value.x) * 0.08;
                wigglerPlane.uniforms.drag.value.y += (0 - wigglerPlane.uniforms.drag.value.y) * 0.08;
                if(wigglerPlane.userData.mouseOver) {
                    wigglerPlane.uniforms.time.value += (45 - wigglerPlane.uniforms.time.value) * 0.05;
                }
                else {
                    wigglerPlane.uniforms.time.value += (0 - wigglerPlane.uniforms.time.value) * 0.05;
                } 
            } 
        });
    }
    //#endregion
    
    //add resize listener to update resolution uniforms
    window.addEventListener("resize", () => {
        asciiPass.uniforms.resolution.value.x = curtainCanvas.offsetWidth;
        asciiPass.uniforms.resolution.value.y = curtainCanvas.offsetHeight;
    });
    window.addEventListener("mouseup", () => {
        for(const wp of wigglerPlanes){
            wp.userData.beingDragged = false;
        }
    });
});