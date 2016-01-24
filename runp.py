#!./venv/local/bin python
import sys
from app.app import create_app

app = create_app(environment=sys.argv[1])
app.run(debug=False, use_reloader=False, port=int(sys.argv[2]), host='0.0.0.0')
