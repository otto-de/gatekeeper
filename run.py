import sys
from app.app import create_app

environment = sys.argv[1]
port = int(sys.argv[2])
debug = sys.argv[3] == "true"

app = create_app(environment=environment, port=port)
print("\nApplication staring...")
print(" Environment: " + str(environment))
print(" Port: " + str(port))
print(" Debug: " + str(debug))
app.run(debug=debug, use_reloader=False, port=port, host='0.0.0.0')
