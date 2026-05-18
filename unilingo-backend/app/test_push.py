import firebase_admin
from firebase_admin import credentials, messaging

cred = credentials.Certificate("./firebase-service-account.json")
firebase_admin.initialize_app(cred)

token = "fMQyvUn4SJWYY_sgu-Ji69:APA91bGZuwqlQgYKTtA_vLVz1RKP2ggvdh99HXlCZB4njuj3P1PpM5-4nvc72V79tBq4h7hY1cLpDcHKDOzvSwnkroxgXr2IEvfNDYX4pFToGHyY70G0Rzg"

msg = messaging.Message(
    token=token,
    notification=messaging.Notification(title="Test", body="This is a push test!"),
    android=messaging.AndroidConfig(priority="high", notification=messaging.AndroidNotification(sound="default", channel_id="default")),
    apns=messaging.APNSConfig(payload=messaging.APNSPayload(aps=messaging.Aps(sound="default", content_available=True)))
)
try:
    res = messaging.send(msg)
    print("Success:", res)
except Exception as e:
    print("Failed:", e)
