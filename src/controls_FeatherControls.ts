import { Camera, Vector3, Euler, MathUtils } from 'three';

/**
 * FeatherControls - Smooth, physics-based camera controls
 * for a fly-through experience with gentle, feathery movements
 */
export class FeatherControls {
  camera: Camera;
  domElement: HTMLElement;
  
  // Configuration
  enabled = true;
  speed = 0.2;
  damping = 0.05;
  flySpeed = 1.0;
  rotationSpeed = 2.0;
  
  // Internal state
  private velocity = new Vector3();
  private rotation = new Euler(0, 0, 0, 'YXZ');
  private targetRotation = new Euler(0, 0, 0, 'YXZ');
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private moveUp = false;
  private moveDown = false;
  private autoFly = false;
  private mouseDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  
  constructor(camera: Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    // Initialize rotation from camera
    this.rotation.copy(this.extractRotationFromCamera());
    this.targetRotation.copy(this.rotation);
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Update the camera position and rotation based on user input
   */
  update() {
    if (!this.enabled) return;
    
    // Update rotation with damping
    this.rotation.x += (this.targetRotation.x - this.rotation.x) * this.damping * 5;
    this.rotation.y += (this.targetRotation.y - this.rotation.y) * this.damping * 5;
    
    // Extract the camera's directional vectors
    const forward = new Vector3(0, 0, -1).applyEuler(this.rotation);
    const right = new Vector3(1, 0, 0).applyEuler(this.rotation);
    const up = new Vector3(0, 1, 0);
    
    // Reset acceleration
    const acceleration = new Vector3(0, 0, 0);
    
    // Apply movement based on key input
    if (this.moveForward || this.autoFly) {
      acceleration.add(forward.multiplyScalar(this.speed * (this.autoFly ? 0.5 : 1)));
    }
    if (this.moveBackward) {
      acceleration.add(forward.multiplyScalar(-this.speed));
    }
    if (this.moveRight) {
      acceleration.add(right.multiplyScalar(this.speed));
    }
    if (this.moveLeft) {
      acceleration.add(right.multiplyScalar(-this.speed));
    }
    if (this.moveUp) {
      acceleration.add(up.multiplyScalar(this.speed));
    }
    if (this.moveDown) {
      acceleration.add(up.multiplyScalar(-this.speed));
    }
    
    // Apply acceleration and damping to velocity
    this.velocity.add(acceleration);
    this.velocity.multiplyScalar(1 - this.damping);
    
    // Apply velocity to camera position
    this.camera.position.add(this.velocity);
    
    // Update camera rotation
    this.camera.rotation.copy(this.rotation);
  }
  
  /**
   * Apply camera euler angles from the camera's quaternion
   */
  private extractRotationFromCamera(): Euler {
    const euler = new Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(this.camera.quaternion);
    return euler;
  }
  
  /**
   * Set up event listeners for keyboard and mouse input
   */
  private setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Mouse events
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Touch events for mobile
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this));
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    
    // Prevent context menu on right-click
    this.domElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }
  
  /**
   * Handle keydown events
   */
  private onKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return;
    
    switch (event.code) {
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        this.moveUp = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveDown = true;
        break;
      case 'KeyF':
        this.autoFly = !this.autoFly;
        break;
    }
  }
  
  /**
   * Handle keyup events
   */
  private onKeyUp(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'KeyD':
        this.moveRight = false;
        break;
      case 'Space':
        this.moveUp = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveDown = false;
        break;
    }
  }
  
  /**
   * Handle mouse down events
   */
  private onMouseDown(event: MouseEvent) {
    if (!this.enabled) return;
    
    this.mouseDragging = true;
    this.prevMouseX = event.clientX;
    this.prevMouseY = event.clientY;
  }
  
  /**
   * Handle mouse up events
   */
  private onMouseUp(event: MouseEvent) {
    this.mouseDragging = false;
  }
  
  /**
   * Handle mouse move events
   */
  private onMouseMove(event: MouseEvent) {
    if (!this.enabled || !this.mouseDragging) return;
    
    // Calculate mouse movement
    const movementX = event.clientX - this.prevMouseX;
    const movementY = event.clientY - this.prevMouseY;
    this.prevMouseX = event.clientX;
    this.prevMouseY = event.clientY;
    
    // Apply rotation (with damping effect)
    this.targetRotation.y -= movementX * 0.002 * this.rotationSpeed;
    this.targetRotation.x -= movementY * 0.002 * this.rotationSpeed;
    
    // Limit vertical rotation (prevent upside-down view