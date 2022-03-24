// import * as THREE from "../libs/three.js/build/three.module.js";

import * as THREE from "../libs/three.js/build/three.module.js";

window.cesiumViewer = new Cesium.Viewer('cesiumContainer', {
    useDefaultRenderLoop: false,
    animation: false,
    baseLayerPicker : false,
    fullscreenButton: true, 
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    imageryProvider : Cesium.createOpenStreetMapImageryProvider({url : 'https://a.tile.openstreetmap.org/'}),
    terrainShadows: Cesium.ShadowMode.DISABLED,
});

// let cp = new Cesium.Cartesian3(4303414.154026048, 552161.235598733, 4660771.704035539);
let cp = new Cesium.Cartesian3(258037.1148908045,471088.2776498632,469.707889884283);

cesiumViewer.camera.setView({
    destination : cp,
    orientation: {
        heading : 10, 
        pitch : -Cesium.Math.PI_OVER_TWO * 0.5, 
        roll : 0.0 
    }
});

window.potreeViewer = new Potree.Viewer(document.getElementById("potree_render_area"), {
    useDefaultRenderLoop: false
});
potreeViewer.setEDLEnabled(true);
potreeViewer.setFOV(5);
potreeViewer.setPointBudget(1_000_000);
potreeViewer.setMinNodeSize(0);
potreeViewer.loadSettingsFromURL();
potreeViewer.setBackground(null);

potreeViewer.loadGUI(() => {
    potreeViewer.setLanguage('en');
    $("#menu_appearance").next().show();
    $("#menu_tools").next().show();
    $("#menu_scene").next().show();
    potreeViewer.toggleSidebar();
});

// Potree.loadPointCloud("http://5.9.65.151/mschuetz/potree/resources/pointclouds/opentopography/CA13_1.4/cloud.js", "CA13", function(e){
Potree.loadPointCloud("../../../pointclouds/enschede/metadata.json","Enschede", function(e){
    let pointcloud = e.pointcloud;
    let scene = potreeViewer.scene;
    let material = pointcloud.material;

    scene.addPointCloud(pointcloud);

    material.size = 1;
    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
    // 258037.1148908045, y: 471088.2776498632, z: 469.707889884283
    potreeViewer.scene.view.setView(
        // [257943.09000000003, 468919.75, 500.240000000000002],
        // // [258037.1148908045,471088.2776498632,469.707889884283],
        // [258099.94000000006, 476876.60000000003, 900.0900000000349],
        [246943.09000000003, 450719.75, 6642.698],
        [258099.94000000006, 471876.60000000003, 14.497]
    );

    let pointcloudProjection = e.pointcloud.projection;
    let mapProjection = proj4.defs("WGS84");

    window.toMap = proj4(pointcloudProjection, mapProjection);
    window.toScene = proj4(mapProjection, pointcloudProjection);
    
});

function loop(timestamp){
    requestAnimationFrame(loop);

    potreeViewer.update(potreeViewer.clock.getDelta(), timestamp);
    // console.log(potreeViewer)


    potreeViewer.render();

    if(window.toMap !== undefined){

        {
            let camera = potreeViewer.scene.getActiveCamera();

            let pPos = new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorld);
            let pRight = new THREE.Vector3(600, 0, 0).applyMatrix4(camera.matrixWorld);
            let pUp = new THREE.Vector3(0, 600, 0).applyMatrix4(camera.matrixWorld);
            let pTarget = potreeViewer.scene.view.getPivot();

            let toCes = (pos) => {
                let xy = [pos.x, pos.y];
                let height = pos.z;
                let deg = toMap.forward(xy);
                let cPos = Cesium.Cartesian3.fromDegrees(...deg, height);

                return cPos;
            };

            let cPos = toCes(pPos);
            let cUpTarget = toCes(pUp);
            let cTarget = toCes(pTarget);

            let cDir = Cesium.Cartesian3.subtract(cTarget, cPos, new Cesium.Cartesian3());
            let cUp = Cesium.Cartesian3.subtract(cUpTarget, cPos, new Cesium.Cartesian3());

            cDir = Cesium.Cartesian3.normalize(cDir, new Cesium.Cartesian3());
            cUp = Cesium.Cartesian3.normalize(cUp, new Cesium.Cartesian3());

            cesiumViewer.camera.setView({
                destination : cPos,
                orientation : {
                    direction : cDir,
                    up : cUp
                }
            });

            let aspect = potreeViewer.scene.getActiveCamera().aspect;
            if(aspect < 1){
                let fovy = Math.PI * (potreeViewer.scene.getActiveCamera().fov / 180);
                cesiumViewer.camera.frustum.fov = fovy;
            }else{
                let fovy = Math.PI * (potreeViewer.scene.getActiveCamera().fov / 180);
                let fovx = Math.atan(Math.tan(0.5 * fovy) * aspect) * 2
                cesiumViewer.camera.frustum.fov = fovx;
            }

        }

        cesiumViewer.render();
    }
}

requestAnimationFrame(loop);
