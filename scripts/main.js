import { Curtains, Plane, Vec2 } from "curtainsjs";

window.addEventListener("load", () => {
    const curtains = new Curtains({
        container: "canvas"
    });

    const planeElement = document.getElementsByClassName("canv")[0];
    var res = new Vec2(planeElement.offsetWidth,planeElement.offsetHeight);
    var mouse = new Vec2(0.0,0.0);
    const params = {
        vertexShaderID: planeElement.dataset.vsId,
        fragmentShaderID: planeElement.dataset.fsId,
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

    const plane = new Plane(curtains, planeElement, params);
    
    plane.onRender(() => {
        plane.uniforms.time.value += 0.01;
    });
});