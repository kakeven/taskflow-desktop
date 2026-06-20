const ambiente_dev = true;

let API_BASE_URL;

if (ambiente_dev) {
  API_BASE_URL = "http://127.0.0.1:8000";
} else {
  API_BASE_URL = "https://taskflow-nnno.onrender.com";
}

export { API_BASE_URL };
