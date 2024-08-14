import "./style.css";
import "./costumDatGUI.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
// import Physics from "./Physics";
import Vector3 from "./Library";
class Physics {
  constructor(length, width, height, mass, airVelocity, waterVelocity, rpm) {
    this.length = length;
    this.width = width;
    this.height = height;
    this.mass = mass;
    this.gravity = 9.81;
    this.position = new Vector3(0, 0, 0);
    this.rotation = new Vector3(0, 0, 0);
    this.deg = 0;
    this.velocity = new Vector3(0, 0, 0);
    this.accel = new Vector3(1, 1, 1);
    this.hsubmerged = this.getSubmergedHeight();
    this.airResist = 8;
    this.airDensity = 1.184;
    this.waterResist = 0.5;
    this.waterDensity = 1000;
    this.dt = 0.16;
    this.airVelocity = airVelocity;
    this.waterVelocity = waterVelocity;
    this.rpm=rpm;
    this.enginForce = 2;
    this.InputThrottle = 0.0;


    document.addEventListener("keydown", (event) => {
      if (event.key == "w") {
        if (this.InputThrottle <= 1) {
          this.InputThrottle += 0.1;
        }
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key == "a") {
        this.deg += Math.PI / 100;
        console.log(this.deg);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key == "d") {
        this.deg -= Math.PI / 100;
        console.log(this.deg);
      }
    });

  }

  // حساب الارتفاع المغمور بناءً على قوة الطفو

  getSubmergedHeight() {
    const volume = this.length * this.width * this.height;
    const buoyantForce = this.mass * this.gravity;
    const waterDensity = 1000; // كثافة الماء بالكيلوغرام/متر مكعب

    // حجم الجزء المغمور من القارب
    const submergedVolume = buoyantForce / (waterDensity * this.gravity);

    // ارتفاع الجزء المغمور من القارب
    const submergedHeight = submergedVolume / (this.length * this.width);
    //    console.log('submerged hieght'+submergedHeight)
    return submergedHeight;
  }

  updateParams(length, width, height, mass, airVelocity, waterVelocity, rpm) {
    this.length = length;
    this.width = width;
    this.height = height;
    this.mass = mass;
    this.airVelocity = airVelocity;
    this.waterVelocity = waterVelocity;
    this.rpm = rpm;
  }

  isSinking() {
    const submergedHeight = this.getSubmergedHeight();
    return submergedHeight >= this.height;
  }
  //////////////2222222222222222/////////////////////

  update() {
    ///// Total force
    this.deg %= Math.PI*2;
   
    if (this.InputThrottle > 0)
      this.InputThrottle -= 0.01
    if (this.InputThrottle <= 0) {
      this.InputThrottle = 0;
    }
    var totalF = this.totalForce();
    totalF = totalF.multiplyScalar(this.dt);

    
  

    ///// Position
    this.position = this.position.addVector(totalF)
    
    


  }

  ///////////////////// Total Force ///////////////
  totalForce() {
    var tf = new Vector3();
    tf = tf.addVector(this.pushForce());
    tf = tf.subVector(this.dragForce());
    return tf;
  }

  pushForce() {
     //// if rpm 7000 ? : 5000 : 2000 : 500
     if (this.rpm <500) {
        this.enginForce = 50;
     } else if (this.rpm < 2000) {
      this.enginForce = 300;
     } else if (this.rpm < 5000) {
      this.enginForce = 500;
 
     } else if (this.rpm < 7000) {
      this.enginForce = 700;
     } else {
      this.enginForce = 700;
     }
    this.throttle = this.InputThrottle * this.enginForce;
    var tractionForce = this.throttle;
    console.log(this.deg)
    var tractionVector = new Vector3(-tractionForce * (Math.cos(this.deg)), 0,    tractionForce * Math.sin(this.deg)
  );
    this.rotation = tractionVector
    return tractionVector;
  }
  applyRotation(deg) {
    this.deg = deg;
    console.log(this.deg, deg);
  }
  dragForce() {
    var F_drag = (this.airForce().addVector(this.waterForce()));
    return F_drag;
  }

  calculateFrontFaceForAir() {
    var ft = this.width * (this.height - this.hsubmerged);
    return ft;
  }

  calculateFrontFaceForWater() {
    var ft = this.width * this.hsubmerged;
    return ft;
  }

  airForce() {
    var airValue = 0.5 * (this.calculateFrontFaceForAir() * this.airResist * this.airDensity * this.airVelocity * this.airVelocity);
    var airDir = new Vector3(0, 0, airValue);
    return airDir;
  }
  
  waterForce() {
    
    var waterValue = 0.5 * (this.calculateFrontFaceForWater() * this.waterResist * this.waterDensity * this.waterVelocity * this.waterVelocity);

    var waterDir = new Vector3(0, 0, waterValue);
    return waterDir;
  }


}


export default Physics;
