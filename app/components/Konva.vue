<script lang="ts" setup>
import { onMounted } from "vue";
import { Pencil, Eraser } from "@lucide/vue";
import KonvaControlItem from "~/components/KonvaControlItem.vue";
import config from "~/config";

const stage = useState("konvaStage", () => shallowRef());

const canvasElement = useTemplateRef("canvas");

const brushSizes = [3, 10, 20];
const brushSize = ref(brushSizes[0]);

const brushColor = "#222";

const drawMode = ref<"brush" | "eraser">("brush");

const canvasWidth = config.canvasSize.width / 2;
const canvasHeight = config.canvasSize.height / 2;

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

  layer.add(
    new Konva.Rect({
      width: stage.value.width(),
      height: stage.value.height(),
      fill: "white",
      strokeWidth: 1,
      stroke: "gray",
    }),
  );

  // then we are going to draw into special canvas element
  const canvas = document.createElement("canvas");
  canvas.width = stage.value.width() * 2;
  canvas.height = stage.value.height() * 2;

  // created canvas we can add to layer as "Konva.Image" element
  const image = new Konva.Image({
    image: canvas,
    x: 0,
    y: 0,
  });

  layer.add(image);

  // Good. Now we need to get access to context element
  const context = canvas.getContext("2d");
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
  <div class="flex justify-center mb-4">
    <div
      ref="canvas"
      :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
    ></div>
  </div>

  <div class="flex justify-between">
    <div class="controls flex">
      <KonvaControlItem
        v-for="availableSize in brushSizes"
        :active="brushSize === availableSize"
        @click="brushSize = availableSize"
      >
        <div
          class="rounded-full block"
          :style="{
            width: availableSize * 2 + 'px',
            height: availableSize * 2 + 'px',
            backgroundColor: brushColor,
          }"
        ></div>
      </KonvaControlItem>
    </div>

    <div class="controls flex">
      <KonvaControlItem @click="drawMode = 'brush'" :active="drawMode === 'brush'">
        <Pencil :size="20" />
      </KonvaControlItem>

      <KonvaControlItem @click="drawMode = 'eraser'" :active="drawMode === 'eraser'">
        <Eraser :size="20" />
      </KonvaControlItem>
    </div>
  </div>
</template>
