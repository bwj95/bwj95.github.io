const defaultLibrary = {
    "Shoulder (Glenohumeral)": {
        "Rotator Cuff": [
            { "name": "Isometric External Rotation", "description": "Push back of hand against a wall with elbow at 90 degrees." },
            { "name": "Resisted External Rotation", "description": "Isotonic glenohumeral external rotation utilizing a resistance band." },
            { "name": "Resisted Internal Rotation", "description": "Isotonic glenohumeral internal rotation utilizing a resistance band." },
            { "name": "Wand-Assisted Shoulder External Rotation", "description": "Elbow at side, use a wand to rotate the forearm outward." }
        ],
        "Deltoids & Flexors": [
            { "name": "Anterior Wall Walks", "description": "Active-assisted anterior glenohumeral flexion by walking fingers up a wall." },
            { "name": "Lateral Wall Walks", "description": "Active-assisted glenohumeral abduction by walking fingers up a wall laterally." },
            { "name": "Wand-Assisted Shoulder Flexion", "description": "Lying or standing, use a wand to guide the affected arm into overhead flexion." },
            { "name": "Wand-Assisted Shoulder Abduction", "description": "Use a wand to push the affected arm outward and up to the side." },
            { "name": "Bilateral Resisted Shoulder Flexion", "description": "Bilateral anterior glenohumeral flexion using resistance band tension." },
            { "name": "Codman's Pendulum Exercises", "description": "Passive glenohumeral circumduction utilizing trunk momentum to gently mobilize the joint." }
        ],
        "Mobility & Scaption": [
            { "name": "Wand-Assisted Passive Scaption", "description": "Gently guide the arm upwards in the plane of the scapula (30 degrees forward)." },
            { "name": "Swiss Ball Wall Stabilization", "description": "Closed kinetic chain scapular and glenohumeral stabilization by rolling a swiss ball on a wall." }
        ]
    },
    "Scapulothoracic (Shoulder Blade)": {
        "Serratus Anterior": [
            { "name": "Serratus Anterior Foam Roller Wall Slides", "description": "Vertical wall slide using a foam roller, focusing on scapular upward rotation and serratus anterior activation." },
            { "name": "Resisted Serratus Anterior Punches", "description": "Dynamic scapular protraction against resistance band tension to target serratus anterior." },
            { "name": "Prone Scapular Protraction (Push-up Plus)", "description": "Closed kinetic chain scapular protraction at the peak of a push-up to engage the serratus anterior." }
        ],
        "Trapezius & Rhomboids": [
            { "name": "Scapular Retraction", "description": "Squeeze shoulder blades together and down." },
            { "name": "Band Pull-Aparts", "description": "Horizontal abduction against resistance band." },
            { "name": "Resisted Scapular Retraction (Rows)", "description": "Bilateral resisted scapular retraction and glenohumeral extension utilizing a resistance band." },
            { "name": "Vertical Scapular Wall Slides", "description": "Slide forearms vertically along a wall to improve scapular upward rotation and shoulder flexion." },
            { "name": "Resisted Horizontal Abduction Pulses", "description": "Short-range, rapid isotonic horizontal abduction pulses against band resistance." }
        ]
    },
    "Chest & Anterior Shoulder": {
        "Pectoralis Major": [
            { "name": "Pectoralis Major Doorway Stretch", "description": "Stand in a doorway with arms at 90 degrees, lean forward gently." }
        ]
    }
}

const defaultRoutineData = {
    "2026-05-03": [
        {
            "id": "1ac65825",
            "name": "Anterior Wall Walks",
            "category": "Deltoids & Flexors",
            "reps": "10 reps",
            "sets": "3",
            "description": "Active-assisted anterior glenohumeral flexion by walking fingers up a wall.",
            "completed": false
        },
        {
            "id": "832b2891",
            "name": "Pectoralis Major Doorway Stretch",
            "category": "Pectoralis Major",
            "reps": "10 reps",
            "sets": "3",
            "description": "Stand in a doorway with arms at 90 degrees, lean forward gently.",
            "completed": false
        },
        {
            "id": "ac80c281",
            "name": "Swiss Ball Wall Stabilization",
            "category": "Mobility & Scaption",
            "reps": "10 reps",
            "sets": "3",
            "description": "Closed kinetic chain scapular and glenohumeral stabilization by rolling a swiss ball on a wall.",
            "completed": false
        }
    ]
}
