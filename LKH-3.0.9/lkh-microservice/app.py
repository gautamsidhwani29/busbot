from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    param_file = "/app/input.par"

    # Write the parameter file
    with open(param_file, "w") as f:
        f.write(f"PROBLEM_FILE = {data['problem_file']}\n")
        f.write(f"OUTPUT_TOUR_FILE = {data.get('output_file', '/app/output.tour')}\n")

    # Run LKH solver
    result = subprocess.run(["/app/LKH", param_file], capture_output=True, text=True)

    return jsonify({"status": "completed", "output": result.stdout})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
