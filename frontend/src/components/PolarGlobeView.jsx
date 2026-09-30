import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Navigation } from 'lucide-react';

// Default official polar stations fallback in case API data is still loading or empty
const DEFAULT_POLAR_STATIONS = [
  {
    stationId: 'maitri',
    name: 'Maitri',
    region: 'Antarctica',
    location: 'Schirmacher Oasis, Queen Maud Land, East Antarctica',
    coordinates: { lat: -70.767, lng: 11.733 },
    establishedYear: 1989,
    description: "India's second permanent research station in Antarctica, commissioned in 1989 in the rocky terrain of Schirmacher Oasis."
  },
  {
    stationId: 'bharati',
    name: 'Bharati',
    region: 'Antarctica',
    location: 'Larsemann Hills, East Antarctica',
    coordinates: { lat: -69.407, lng: 76.187 },
    establishedYear: 2012,
    description: "India's cutting-edge third Antarctic research station, commissioned in 2012 between Thala Fjord and Quilty Bay."
  },
  {
    stationId: 'himadri',
    name: 'Himadri',
    region: 'Arctic',
    location: 'Ny-Ålesund, Spitsbergen, Svalbard, Norway',
    coordinates: { lat: 78.923, lng: 11.928 },
    establishedYear: 2008,
    description: "India's premier Arctic station at Ny-Ålesund, Svalbard, monitoring Arctic cryosphere, oceanography, and atmospheric teleconnections."
  },
  {
    stationId: 'himansh',
    name: 'Himansh',
    region: 'Himalayas',
    location: 'Chandra Basin, Spiti Valley, Himachal Pradesh',
    coordinates: { lat: 32.4, lng: 77.6 },
    establishedYear: 2016,
    description: "High-altitude Himalayan research station at 4,000+ m altitude for monitoring cryospheric glacier mass dynamics."
  },
  {
    stationId: 'dakshin-gangotri',
    name: 'Dakshin Gangotri',
    region: 'Antarctica',
    location: 'Princess Astrid Coast, Queen Maud Land, Antarctica',
    coordinates: { lat: -70.08, lng: 12.0 },
    establishedYear: 1983,
    description: "India's historic first Antarctic research base, established during the Third Indian Antarctic Expedition in 1983."
  },
  {
    stationId: 'indarc',
    name: 'IndARC',
    region: 'Arctic',
    location: 'Kongsfjorden, Svalbard (Underwater Moored Observatory)',
    coordinates: { lat: 78.9, lng: 11.92 },
    establishedYear: 2014,
    description: "India's first multi-sensor underwater moored Arctic observatory in Kongsfjorden fjord."
  }
];

// Math helper: Converts Latitude (-90 to 90) and Longitude (-180 to 180) to 3D Cartesian coordinates on sphere
const latLngToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
};

// Procedural fallback texture in case external CDN is slow or offline
const createFallbackEarthTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep ocean gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#bae6fd'); // North pole Arctic ice cap
  grad.addColorStop(0.12, '#0369a1');
  grad.addColorStop(0.5, '#0284c7');
  grad.addColorStop(0.85, '#0369a1');
  grad.addColorStop(1, '#ffffff'); // South pole Antarctica ice sheet
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Antarctica continent
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(512, 490, 480, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arctic ice
  ctx.beginPath();
  ctx.ellipse(512, 20, 360, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

// Create a high-DPI billboard canvas sprite for station name badge
const createStationLabelSprite = (station) => {
  const canvas = document.createElement('canvas');
  canvas.width = 380;
  canvas.height = 90;
  const ctx = canvas.getContext('2d');

  const reg = (station.region || '').toLowerCase();
  const isAntarctica = reg.includes('antarct');
  const isArctic = reg.includes('arctic');
  const bgColor = isAntarctica ? '#0284c7' : isArctic ? '#0f766e' : '#b45309';
  const tagColor = isAntarctica ? '#38bdf8' : isArctic ? '#2dd4bf' : '#fde047';

  // Card background with rounded corners and drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(10, 10, 360, 70, 20);
  ctx.fill();

  // Vibrant border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Left Icon Pin Indicator (white circular badge)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(42, 45, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(42, 45, 7, 0, Math.PI * 2);
  ctx.fill();

  // Station Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(station.name, 68, 36);

  // Region Subtitle Badge
  ctx.fillStyle = tagColor;
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillText(`📍 ${station.region.toUpperCase()}`, 68, 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(24, 5.7, 1);
  return sprite;
};

export const PolarGlobeView = ({
  stations = [],
  assets = [],
  showAssets = true,
  activeStation = null,
  onSelectStation = () => {}
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeGroupRef = useRef(null);
  const cloudsMeshRef = useRef(null);
  const stationPinsGroupRef = useRef(null);
  const assetPinsGroupRef = useRef(null);
  const pulsingRingsRef = useRef([]);
  const animFrameIdRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [hoveredStation, setHoveredStation] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activePreset, setActivePreset] = useState('south-pole');

  // Virtual Trackball quaternion rotation
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const currentQuatRef = useRef(new THREE.Quaternion());
  const targetQuatRef = useRef(new THREE.Quaternion());
  const targetZoomRef = useRef(230);
  const currentZoomRef = useRef(230);

  // Merge provided stations with fallback to guarantee all 6 official Indian stations are always present
  const mergedStations = useMemo(() => {
    if (!stations || stations.length === 0) return DEFAULT_POLAR_STATIONS;
    // Ensure vital stations like Maitri, Bharati, Himadri exist
    const map = new Map();
    DEFAULT_POLAR_STATIONS.forEach((st) => map.set(st.stationId, st));
    stations.forEach((st) => {
      if (st.coordinates?.lat !== undefined && st.coordinates?.lng !== undefined) {
        map.set(st.stationId || st.name.toLowerCase(), st);
      }
    });
    return Array.from(map.values());
  }, [stations]);

  // Set initial orientation facing Antarctica (South Pole)
  useEffect(() => {
    // Target vector for Maitri / Antarctica
    const southPoleVec = latLngToVector3(-70.767, 11.733, 1).normalize();
    const initQuat = new THREE.Quaternion().setFromUnitVectors(southPoleVec, new THREE.Vector3(0, 0, 1));
    targetQuatRef.current.copy(initQuat);
    currentQuatRef.current.copy(initQuat);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (FOV 45)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 0, currentZoomRef.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Space & Sun Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    sunLight.position.set(250, 180, 200);
    scene.add(sunLight);

    const southFill = new THREE.DirectionalLight(0x7dd3fc, 1.2);
    southFill.position.set(0, -350, 150);
    scene.add(southFill);

    const northFill = new THREE.DirectionalLight(0x99f6e4, 1.0);
    northFill.position.set(0, 350, 150);
    scene.add(northFill);

    // Starfield Background
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 1400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1600;
      starPositions[i + 1] = (Math.random() - 0.5) * 1600;
      starPositions[i + 2] = -250 - Math.random() * 800;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 1.8,
      transparent: true,
      opacity: 0.8
    });
    const starField = new THREE.Points(starsGeom, starsMat);
    scene.add(starField);

    // Globe Group
    const globeGroup = new THREE.Group();
    globeGroup.quaternion.copy(currentQuatRef.current);
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Earth Sphere (radius = 100)
    const earthRadius = 100;
    const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);
    const fallbackTexture = createFallbackEarthTexture();
    const earthMat = new THREE.MeshStandardMaterial({
      map: fallbackTexture,
      roughness: 0.65,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    globeGroup.add(earthMesh);

    // High-Resolution NASA Blue Marble Earth Textures
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_atmos_2048.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        earthMat.map = texture;
        earthMat.needsUpdate = true;
      }
    );

    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_normal_2048.jpg',
      (normalTexture) => {
        earthMat.normalMap = normalTexture;
        earthMat.normalScale = new THREE.Vector2(0.6, 0.6);
        earthMat.needsUpdate = true;
      }
    );

    // Cloud Sphere
    const cloudsGeom = new THREE.SphereGeometry(earthRadius + 1.2, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeom, cloudsMat);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/planets/earth_clouds_1024.png',
      (cloudsTexture) => {
        cloudsMat.map = cloudsTexture;
        cloudsMat.needsUpdate = true;
      }
    );

    // Atmosphere Glow Halo
    const atmosGeom = new THREE.SphereGeometry(earthRadius + 3.5, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    globeGroup.add(atmosMesh);

    // Dedicated Station Pins Group
    const stationPinsGroup = new THREE.Group();
    globeGroup.add(stationPinsGroup);
    stationPinsGroupRef.current = stationPinsGroup;

    // Dedicated In-Situ Field Assets Group
    const assetPinsGroup = new THREE.Group();
    globeGroup.add(assetPinsGroup);
    assetPinsGroupRef.current = assetPinsGroup;

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Main 60FPS Animation Loop
    let pulseTime = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      pulseTime += 0.035;

      // Rotate clouds
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0003;
      }

      // Auto-rotation around Earth's polar Y axis if enabled
      if (autoRotate && !isDraggingRef.current) {
        const autoQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.003);
        targetQuatRef.current.premultiply(autoQuat);
      }

      // Smooth Spherical Quaternion Interpolation (Slerp)
      currentQuatRef.current.slerp(targetQuatRef.current, 0.1);
      globeGroup.quaternion.copy(currentQuatRef.current);

      // Smooth Zoom
      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.12;
      camera.position.z = currentZoomRef.current;

      // Animate Station Ground Radar Pulse Rings
      pulsingRingsRef.current.forEach((item) => {
        if (!item.ring) return;
        const phase = (pulseTime + item.offset) % 2;
        const scale = 1 + phase * 2.2;
        item.ring.scale.set(scale, scale, 1);
        if (item.ring.material) {
          item.ring.material.opacity = Math.max(0, (1 - phase / 2) * 0.9);
        }
      });

      // Occlusion check: Toggle label billboard visibility based on world Z depth
      if (stationPinsGroupRef.current) {
        stationPinsGroupRef.current.children.forEach((group) => {
          const worldPos = new THREE.Vector3();
          group.getWorldPosition(worldPos);

          // Find the sprite child inside this station group
          const spriteChild = group.children.find((c) => c.isSprite);
          if (spriteChild) {
            // If facing the camera (worldPos.z > 15), visible; if rotated behind globe (worldPos.z <= 15), hide
            spriteChild.visible = worldPos.z > 15;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeom.dispose();
      earthMat.dispose();
      cloudsGeom.dispose();
      cloudsMat.dispose();
      atmosGeom.dispose();
      atmosMat.dispose();
      starsGeom.dispose();
      starsMat.dispose();
    };
  }, [autoRotate]);

  // Render 3D Pins whenever stations change
  useEffect(() => {
    if (!stationPinsGroupRef.current) return;
    const group = stationPinsGroupRef.current;

    // Clean up previous pins
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj.traverse) {
        obj.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material.dispose();
          }
        });
      }
    }
    pulsingRingsRef.current = [];

    const earthRadius = 100;

    // Build prominent 3D Pins for each station
    mergedStations.forEach((st, idx) => {
      const lat = st.coordinates?.lat;
      const lng = st.coordinates?.lng;
      if (lat === undefined || lng === undefined) return;

      const reg = (st.region || '').toLowerCase();
      const isAntarctica = reg.includes('antarct');
      const isArctic = reg.includes('arctic');
      const pinColor = isAntarctica ? 0x00e5ff : isArctic ? 0x00f5d4 : 0xfbbf24;
      const emissiveColor = isAntarctica ? 0x0284c7 : isArctic ? 0x0d9488 : 0xd97706;

      // Station Root Group positioned exactly at lat/lng on Earth surface
      const stationGroup = new THREE.Group();
      const normal = latLngToVector3(lat, lng, 1).normalize();
      stationGroup.position.copy(normal.clone().multiplyScalar(earthRadius));
      stationGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // 1. Surface Ground Anchor Disc (Fixed base)
      const anchorGeom = new THREE.CylinderGeometry(2.0, 2.5, 0.4, 24);
      const anchorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const anchor = new THREE.Mesh(anchorGeom, anchorMat);
      anchor.position.set(0, 0.2, 0);
      stationGroup.add(anchor);

      // 2. Animated Pulsing Radar Ring (expands along the surface)
      const ringGeom = new THREE.RingGeometry(2.2, 4.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.4, 0);
      stationGroup.add(ring);
      pulsingRingsRef.current.push({ ring, offset: idx * 0.4 });

      // 3. Tall 3D Pin Needle / Stem (Height: 12 units)
      const stemGeom = new THREE.CylinderGeometry(0.5, 0.9, 12, 16);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: emissiveColor,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8
      });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.set(0, 6, 0);
      stationGroup.add(stem);

      // 4. Large Glowing 3D Beacon Head (Radius: 4.2 units)
      const headGeom = new THREE.SphereGeometry(4.2, 24, 24);
      const headMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        emissive: pinColor,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.5
      });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.set(0, 13, 0);
      head.userData = { station: st, isStation: true };
      stationGroup.add(head);

      // 5. Crisp Floating Station Billboard Label
      const labelSprite = createStationLabelSprite(st);
      labelSprite.position.set(0, 22, 0);
      labelSprite.userData = { station: st, isStation: true };
      stationGroup.add(labelSprite);

      group.add(stationGroup);
    });
  }, [mergedStations]);

  // Render Field Asset Dots
  useEffect(() => {
    if (!assetPinsGroupRef.current) return;
    const group = assetPinsGroupRef.current;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    if (!showAssets || !assets || assets.length === 0) return;

    const earthRadius = 100;
    const assetGeom = new THREE.SphereGeometry(1.6, 16, 16);

    assets.forEach((asset) => {
      const lat = asset.coordinates?.lat;
      const lng = asset.coordinates?.long || asset.coordinates?.lng;
      if (lat === undefined || lng === undefined) return;

      const pos = latLngToVector3(lat, lng, earthRadius + 2);
      const isDataset = asset.category === 'dataset';
      const color = isDataset ? 0x14b8a6 : 0xf59e0b;

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.9,
        roughness: 0.2
      });
      const mesh = new THREE.Mesh(assetGeom, mat);
      mesh.position.copy(pos);
      mesh.userData = { asset: asset, isAsset: true };
      group.add(mesh);
    });
  }, [assets, showAssets]);

  // Focus station with smooth rotation animation
  const focusStation = useCallback((st) => {
    if (!st || !st.coordinates) return;
    const lat = st.coordinates.lat;
    const lng = st.coordinates.lng;

    // Target vector on unit sphere
    const targetVec = latLngToVector3(lat, lng, 1).normalize();
    // Rotation quaternion that maps targetVec directly to +Z (camera front)
    const q = new THREE.Quaternion().setFromUnitVectors(targetVec, new THREE.Vector3(0, 0, 1));
    targetQuatRef.current.copy(q);
    targetZoomRef.current = st.region === 'Antarctica' ? 185 : 195;
    onSelectStation(st);
  }, [onSelectStation]);

  // Preset viewpoint handlers
  const handlePreset = (preset) => {
    setActivePreset(preset);
    if (preset === 'south-pole') {
      // Focus directly down at South Pole / Maitri & Bharati (Antarctica)
      const southPoleVec = latLngToVector3(-75, 45, 1).normalize();
      targetQuatRef.current.setFromUnitVectors(southPoleVec, new THREE.Vector3(0, 0, 1));
      targetZoomRef.current = 190;
    } else if (preset === 'north-pole') {
      // Focus directly down at North Pole / Himadri (Arctic)
      const northPoleVec = latLngToVector3(78.9, 12, 1).normalize();
      targetQuatRef.current.setFromUnitVectors(northPoleVec, new THREE.Vector3(0, 0, 1));
      targetZoomRef.current = 190;
    } else if (preset === 'himalayas') {
      // Focus on Himalayas / Himansh
      const himalayasVec = latLngToVector3(32.4, 77.6, 1).normalize();
      targetQuatRef.current.setFromUnitVectors(himalayasVec, new THREE.Vector3(0, 0, 1));
      targetZoomRef.current = 200;
    } else {
      // Global overview
      const globalVec = latLngToVector3(10, 60, 1).normalize();
      targetQuatRef.current.setFromUnitVectors(globalVec, new THREE.Vector3(0, 0, 1));
      targetZoomRef.current = 240;
    }
  };

  // Sync with activeStation prop
  useEffect(() => {
    if (activeStation) {
      focusStation(activeStation);
    }
  }, [activeStation, focusStation]);

  // Virtual Trackball Mouse Controls
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast for hover detection
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const candidates = [];
    if (stationPinsGroupRef.current) candidates.push(...stationPinsGroupRef.current.children);
    if (assetPinsGroupRef.current) candidates.push(...assetPinsGroupRef.current.children);

    const intersects = raycaster.intersectObjects(candidates, true);
    const stationIntersect = intersects.find((i) => i.object.userData?.isStation);
    const assetIntersect = intersects.find((i) => i.object.userData?.isAsset);

    if (stationIntersect) {
      container.style.cursor = 'pointer';
      setHoveredStation({
        type: 'station',
        data: stationIntersect.object.userData.station
      });
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else if (assetIntersect) {
      container.style.cursor = 'pointer';
      setHoveredStation({
        type: 'asset',
        data: assetIntersect.object.userData.asset
      });
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      setHoveredStation(null);
    }

    // Drag rotation using Virtual Trackball Quaternions
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    const rotY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
    const rotX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.005);

    targetQuatRef.current.premultiply(rotX).premultiply(rotY);
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e) => {
    if (isDraggingRef.current) {
      const deltaX = Math.abs(e.clientX - previousMousePositionRef.current.x);
      const deltaY = Math.abs(e.clientY - previousMousePositionRef.current.y);

      if (deltaX < 5 && deltaY < 5 && hoveredStation) {
        if (hoveredStation.type === 'station') {
          focusStation(hoveredStation.data);
        }
      }
    }
    isDraggingRef.current = false;
  };

  // Scroll Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.15;
    targetZoomRef.current = Math.max(140, Math.min(360, targetZoomRef.current + zoomDelta));
  };

  return (
    <div className="relative w-full h-full bg-radial from-slate-900 via-slate-950 to-black select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Floating 3D Globe HUD Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Polar Viewport Preset Buttons */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 flex flex-col gap-1.5 shadow-2xl text-xs text-slate-200">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>Polar Focus</span>
          </div>
          <button
            type="button"
            onClick={() => handlePreset('south-pole')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
              activePreset === 'south-pole' ? 'bg-sky-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>❄️</span>
              <span>Antarctica (South Pole)</span>
            </div>
            <span className="text-[10px] opacity-75 font-mono">Maitri/Bharati</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('north-pole')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
              activePreset === 'north-pole' ? 'bg-teal-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🧊</span>
              <span>Arctic (North Pole)</span>
            </div>
            <span className="text-[10px] opacity-75 font-mono">Himadri</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('himalayas')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
              activePreset === 'himalayas' ? 'bg-amber-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🏔️</span>
              <span>Himalayas (Himansh)</span>
            </div>
            <span className="text-[10px] opacity-75 font-mono">Spiti</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('global')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
              activePreset === 'global' ? 'bg-slate-700 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🌍</span>
              <span>Global Overview</span>
            </div>
            <span className="text-[10px] opacity-75 font-mono">Orbit</span>
          </button>
        </div>

        {/* Orbit / Zoom Controls */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 flex items-center gap-1 shadow-2xl text-xs">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              autoRotate ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle Earth planetary spin"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'Rotating' : 'Spin Globe'}</span>
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <button
            type="button"
            onClick={() => {
              targetZoomRef.current = Math.max(140, targetZoomRef.current - 35);
            }}
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              targetZoomRef.current = Math.min(360, targetZoomRef.current + 35);
            }}
            className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Info Badge in bottom-left */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/70 rounded-xl px-3.5 py-2 text-[11px] text-slate-300 shadow-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong>Interactive 3D Earth Globe:</strong> Click any glowing station beacon or label to inspect • Drag to spin in 3D
          </span>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredStation && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-lg px-3 py-2 shadow-2xl text-xs max-w-xs space-y-1">
            {hoveredStation.type === 'station' ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sky-400">{hoveredStation.data.name} Station</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    {hoveredStation.data.region}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {hoveredStation.data.location}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Coordinates: {hoveredStation.data.coordinates?.lat}°, {hoveredStation.data.coordinates?.lng}°
                </div>
                <div className="text-[10px] text-sky-300 font-semibold pt-0.5">
                  Click to open station details →
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-teal-400 truncate">{hoveredStation.data.title}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-teal-900/50 text-teal-300">
                    {hoveredStation.data.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 line-clamp-2">
                  {hoveredStation.data.summary}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolarGlobeView;
