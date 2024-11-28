import {Curtains, Plane, Vec2, RenderTarget, ShaderPass, TextureLoader} from "curtainsjs";

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

    
    //#region setup fractal noise backgrounds
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
});