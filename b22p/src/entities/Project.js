const exampleProjectData = {
    name: 'my project',
    bpm: 120,
    reverb: { },

    loops: [
        {
            id:"a1s",
            channel: 0,
            url: "/audio/loops/Kit_Drums_MixDown1_C_120BPM.wav", 
            gain:0.7
        },

        {url:  "/audio/loops/Kit_PianoHigh_C_120BPM.wav"},
        {url:  "/audio/metro.wav"},
        {url:  "/audio/loops/51_XIV 120BPM Csmin Sample.wav",gain:0.5},
    ],
    channels: [
        {   
            id: 0,
            gain: 2,
            reverb: 0.2,
            effects: [
                {id: 4, delay: 0.2},
            ]
        }
    ],
    users: [

    ]
	
}

/* 


    project.set("channels.0.effects.4", { data } ) .... 
    project.set("channels.0.effects.4", { data } ) .... 
    project.create("channels.0.effects.4", { data } ) .... 

*/