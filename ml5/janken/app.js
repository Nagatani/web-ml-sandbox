let handPose
let video

// じゃんけん判定
let predictions = []
let userHand = "-"
let aiHand = "-"
let result = "-"

function preload() {
  // Load the handPose model
  handPose = ml5.handPose()
}

function setup() {
  createCanvas(640, 480)
  // Create the webcam video and hide it
  video = createCapture(VIDEO)
  video.size(640, 480)
  video.hide()
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands)
}

async function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height)

  if (predictions.length > 0) {
    const hand = predictions[0]
    const landmarks = hand.keypoints

    // 手のランドマーク(指の位置)を描画 (デバッグ用)
    // console.log(landmarks)
    drawKeypoints(landmarks)

    // じゃんけんの手を認識 (グー, チョキ, パー)
    userHand = classifyHand(landmarks)
    document.getElementById('user-hand').innerText = userHand
  }

  // ランダムにAIの手を生成 (数秒ごとに変更)
  if (userHand !== '-' && frameCount % 120 === 0) { // 2秒に1回AIの手を変える
    aiHand = getRandomHand()
    document.getElementById('ai-hand').innerText = aiHand

    // じゃんけんの勝敗を判定
    result = judge(userHand, aiHand)
    document.getElementById('result').innerText = result
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  predictions = results

  // 手が検出されていない場合、userHandをリセットする
  if (predictions.length === 0) {
    userHand = "-"
    document.getElementById('user-hand').innerText = userHand
  }
}

function drawKeypoints(landmarks) {
  for (let i = 0; i < landmarks.length; i++) {
    const [x, y] = [landmarks[i].x, landmarks[i].y]
    fill(255, 0, 0)
    noStroke()
    ellipse(x, y, 10, 10)
  }
}

function classifyHand(landmarks) {
  // ランドマークから「グー」「チョキ」「パー」を判定
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const ringTip = landmarks[16]
  const pinkyTip = landmarks[20]

  const distanceThumbIndex = dist(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y)
  const distanceIndexMiddle = dist(indexTip.x, indexTip.y, middleTip.x, middleTip.y)

  if (distanceThumbIndex < 30 && distanceIndexMiddle < 30) {
    return "グー"
  } else if (distanceIndexMiddle > 50 && dist(middleTip.x, middleTip.y, ringTip.x, ringTip.y) > 50) {
    return "パー"
  } else {
    return "チョキ"
  }
}

function getRandomHand() {
  const hands = ["グー", "チョキ", "パー"]
  return hands[Math.floor(Math.random() * hands.length)]
}

function judge(user, ai) {
  if (user === ai) {
    return "あいこ"
  } else if ((user === "グー" && ai === "チョキ") ||
    (user === "チョキ" && ai === "パー") ||
    (user === "パー" && ai === "グー")) {
    return "あなたの勝ち！"
  } else {
    return "AIの勝ち..."
  }
}