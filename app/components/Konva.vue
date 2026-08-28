<script lang="ts" setup>
import { onMounted } from "vue";
import { Pencil, Eraser, Trash } from "@lucide/vue";
import KonvaControlItem from "~/components/KonvaControlItem.vue";
import config from "~/config";

const stage = useState("konvaStage", () => shallowRef());

const canvasElement = useTemplateRef("canvas");

const brushSizes = [3, 10, 20];
const brushSize = ref(brushSizes[1]);

const brushColor = "#222";

const drawMode = ref<"brush" | "eraser">("brush");

const canvasWidth = config.canvasSize.width / 2;
const canvasHeight = config.canvasSize.height / 2;

let drawingCanvas: HTMLCanvasElement | null = null;
let drawingContext: CanvasRenderingContext2D | null = null;
let drawingLayer: { batchDraw: () => void } | null = null;

const clear = () => {
  if (!drawingCanvas || !drawingContext || !drawingLayer) return;
  drawingContext.save();
  drawingContext.globalCompositeOperation = "source-over";
  drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  drawingContext.restore();
  drawingLayer.batchDraw();
};

const {
  dialogRef: confirmDialogRef,
  visible: confirmVisible,
  open: openConfirm,
  close: closeConfirm,
  onCancel: onConfirmCancel,
  onBackdropClick: onConfirmBackdropClick,
} = useAnimatedDialog();

function confirmClear() {
  clear();
  closeConfirm();
}

onMounted(async () => {
  const Konva = (await import("konva")).default;

  Konva.pixelRatio = 2;

  stage.value = new Konva.Stage({
    container: canvasElement.value as HTMLDivElement,
    width: canvasWidth,
    height: canvasHeight,
  });

  const layer = new Konva.Layer();
  stage.value.add(layer);
  drawingLayer = layer;

  layer.add(
    new Konva.Rect({
      width: stage.value.width(),
      height: stage.value.height(),
      fill: "white",
      // strokeWidth: 1,
      // stroke: "gray",
    }),
  );

  // then we are going to draw into special canvas element
  const canvas = document.createElement("canvas");
  canvas.width = stage.value.width() * 2;
  canvas.height = stage.value.height() * 2;
  drawingCanvas = canvas;

  // created canvas we can add to layer as "Konva.Image" element
  const image = new Konva.Image({
    image: canvas,
    x: 0,
    y: 0,
  });

  layer.add(image);

  // Good. Now we need to get access to context element
  const context = canvas.getContext("2d");
  drawingContext = context;
  context.strokeStyle = brushColor;
  context.lineJoin = "round";
  context.lineWidth = brushSize.value;

  context.lineCap = "round";
  context.lineJoin = "round";

  let isPaint = false;
  let lastPointerPosition;

  // now we need to bind some events
  // we need to start drawing on mousedown
  // and stop drawing on mouseup
  image.on("mousedown touchstart", function () {
    isPaint = true;
    context.lineWidth = brushSize.value;
    lastPointerPosition = stage.value.getPointerPosition();
  });

  stage.value.on("mouseup touchend", function () {
    isPaint = false;
  });

  let lastPoint = null;
  let lastMid = null;

  stage.value.on("mousedown touchstart", function () {
    isPaint = true;
    const pos = stage.value.getPointerPosition();
    const local = { x: pos.x - image.x(), y: pos.y - image.y() };
    lastPoint = local;
    lastMid = local;
  });

  stage.value.on("mousemove touchmove", function () {
    if (!isPaint) return;

    context.globalCompositeOperation =
      drawMode.value === "eraser" ? "destination-out" : "source-over";

    const pos = stage.value.getPointerPosition();
    const curr = { x: pos.x - image.x(), y: pos.y - image.y() };
    const newMid = {
      x: (lastPoint.x + curr.x) / 2,
      y: (lastPoint.y + curr.y) / 2,
    };

    context.beginPath();
    context.moveTo(lastMid.x, lastMid.y);
    context.quadraticCurveTo(lastPoint.x, lastPoint.y, newMid.x, newMid.y);
    context.stroke();

    lastPoint = curr;
    lastMid = newMid;

    layer.batchDraw();
  });
});
</script>

<template>
  <div class="canvas-wrap">
    <div
      ref="canvas"
      class="canvas-surface"
      :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
    ></div>
  </div>

  <div class="toolbar">
    <div class="controls">
      <KonvaControlItem
        v-for="availableSize in brushSizes"
        :key="availableSize"
        :active="brushSize === availableSize"
        @click="brushSize = availableSize"
      >
        <div
          class="brush-dot"
          :style="{
            width: availableSize + 'px',
            height: availableSize + 'px',
          }"
        ></div>
      </KonvaControlItem>
    </div>

    <div class="controls">
      <KonvaControlItem @click="drawMode = 'brush'" :active="drawMode === 'brush'">
        <Pencil :size="18" />
      </KonvaControlItem>

      <KonvaControlItem @click="drawMode = 'eraser'" :active="drawMode === 'eraser'">
        <Eraser :size="18" />
      </KonvaControlItem>

      <KonvaControlItem @click="openConfirm">
        <Trash :size="18" />
      </KonvaControlItem>
    </div>
  </div>

  <dialog
    ref="confirmDialogRef"
    class="confirm-modal"
    :class="{ 'is-visible': confirmVisible }"
    @cancel="onConfirmCancel"
    @click="onConfirmBackdropClick"
  >
    <p class="confirm-message">Weet je zeker dat je je tekening wilt wissen?</p>
    <div class="confirm-actions">
      <button type="button" class="confirm-cancel" @click="closeConfirm">Annuleren</button>
      <button type="button" class="confirm-ok" @click="confirmClear">Wissen</button>
    </div>
  </dialog>
</template>

<style scoped>
.canvas-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.canvas-surface {
  background: #fff;
  //border: 1px solid rgba(255, 255, 255, 0.3);
  //border-radius: 4px;
  touch-action: none;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.controls {
  display: flex;
  gap: 6px;
}

.brush-dot {
  border-radius: 9999px;
  background: #e8e6e3;
  display: block;
}

.confirm-modal {
  position: fixed;
  inset: 0;
  margin: auto;
  background: #222250;
  color: #e8e6e3;
  border-radius: 8px;
  padding: 24px;
  width: min(320px, calc(100vw - 32px));

  opacity: 0;
  transform: scale(0.97);
  transition:
    opacity 0.15s ease-out,
    transform 0.15s ease-out;
}

.confirm-modal.is-visible {
  opacity: 1;
  transform: scale(1);
}

.confirm-modal::backdrop {
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.15s ease-out;
}

.confirm-modal.is-visible::backdrop {
  opacity: 1;
}

.confirm-message {
  margin: 0 0 20px;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.confirm-cancel,
.confirm-ok {
  border-radius: 4px;
  font: inherit;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.confirm-cancel {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #e8e6e3;
}

.confirm-cancel:hover {
  border-color: rgba(255, 255, 255, 0.6);
}

.confirm-ok {
  background: transparent;
  border: 1px solid #e2bc4e;
  color: #e2bc4e;
}

.confirm-ok:hover {
  background: #e2bc4e;
  color: #222250;
}
</style>
