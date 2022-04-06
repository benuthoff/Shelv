// Barcode Scanner
// by Ben Uthoff

// Socket Pointers
var socket = io();

// Followed https://www.digitalocean.com/community/tutorials/front-and-rear-camera-access-with-javascripts-getusermedia

var video = document.getElementById('video');
var canvas = document.getElementById('canvas');

navigator.mediaDevices.getUserMedia({
	video: {
		frameRate: 5,
		facingMode: {
      		exact: 'environment'
    	}
	}
}).then((stream) => {
	video.srcObject = stream;
	video.play();
	canvas.drawImage(video, 0, 0);
});