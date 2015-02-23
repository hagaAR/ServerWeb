function call(){
	console.log('start_connexionP2P');
	//pb compatibilite firefox/chrome
	if(navigator.webkitGetUserMedia){
		if(localStream.getVideotracks().length>0){
			log('using video device: '+localStream.getVideoTracks()[0].label);
		}
		if(localStream.getAudioTracks().length>0){
			log('using audio device: '+localStream.getAudioTracks()[0].label);
		}
	}
	if(navigator.webkitGetUserMedia){
		RTCPeerConnection = webkitRTCPeerConnection;
		//firefox
	}else if(navigator.mozGetUserMedia){
		RTCPeerConnection=mozRTCPeerConnection;
		RTCSessionDesciption = mozRTCSessionDescription;
		RTCIceCandidate = mozRTCIceCandidate;
	}
	console.log("RTCPeerConnection object: "+RTCPeerConnection);
	//thisis an optional conf string, associated with NAT traversal setup
	var servers=null;
	localPeerConnection = new RTCPeerConnection(servers);
	console.log('Created local peer conn object localPeerConnection');
	//add a handler associated with ICE prot events
	localPeerConnection.onicecandidate = gotLocalIceCandidate;
	remotePeerConnection = new RTCPeerConnection(servers);
	console.log('Created remote peer conn object remotePeerConnection');
	//add an handler associated with ICE prot events
	remotePeerConnection.onicecandidate=gotRemoteIceCandidate;
	//..and a 2nd handler to be activated as soosn as the remote stream becomes avaible
	remotePeerConnection.onaddstream= gotRemoteStream;
	//add the local stream (as returned by getUserMedia()) to the local PeerConnection
	localPeerConnection.addStream(localStream);
	console.log('added localStream to localPeerConnection');
	//Create an Offer to be 'sent' to the callee as soon as the local SDP is ready
	localPeerConnection.createOffer(gotLocalDescription, onSignalingError);
}

function onSignalingError(error){
	console.log('failed to create signaling msg: '+error.name);
}

 function gotLocalDescription(description){
 	localPeerConnection.setLocalDescription(description);
 	console.log('offer from localPeerConnection:\n'+description.sdp);
 	//the same with the remote peerconn
 	remotePeerConnection.setRemoteDescription(description);
 	//Create the Answer to the received Offer based on the 'local' description
 	remotePeerConnection.createAnswer(gotremoteDescription, onSignalingError);
 }
 function gotRemoteDescription(description){
 	//Set the remote description as the local description of the remote peerconn
 	remotePeerConnection.setLocalDescription(description);
 	console.log('answer from remotePeerConnection: \n'+description.sdp);
 	//conversely, set the remote description as the remote description of the local PeerConnection
 	localPeerConnection.setRemoteDescription(description);
 }
function hangup(){
	console.log('ending call');
	//close peerconns
	localPeerConnection.close();
	remotePeerConnection.close();
	//reset local var
	localPeerConnection =null;
	remotePeerConnection= null;
	//disable hangup button
	hangupButton.disabled =true;
	//enable call button to allow for new calls
	callButton.disabled = false;
 }
function gotRemoteStream(event){
	//associate the remote vid element with the retrieved stream
	if(window.URL){
		//Chrome
		remoteVideo.src = window.URL.createObjectURL(event.stream);
	}else{
		//firefox
		remoteVideo.src = event.stream;
	}
	console('received remote stream');
}
function gotLocalIceCandidate(event){
	if(event.candidate){
		//add candidate to the remote PeerConn
		remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
		console.log('local ICE candidate: \n'+ event.candidate);
	}
}
function gotRemoteIceCandidate(event){
	if (event.candidate){
		//add candidate to the local PeerConn
		localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
	}
}
