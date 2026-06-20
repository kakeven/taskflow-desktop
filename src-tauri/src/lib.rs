use tauri_plugin_shell::ShellExt;
use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use std::sync::Mutex;
use std::time::Duration;
use std::thread;

struct SidecarState {
    child: Option<CommandChild>,
    pid: u32,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let (_receiver, child) = app.shell()
                .sidecar("taskflow-api")
                .expect("failed to find sidecar")
                .spawn()
                .expect("failed to spawn sidecar");

            thread::sleep(Duration::from_secs(1));

            let pid = child.pid();
            app.manage(Mutex::new(Some(SidecarState { child: Some(child), pid })));
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();

                let app = window.app_handle().clone();

                std::thread::spawn(move || {
                    if let Some(state) = app.try_state::<Mutex<Option<SidecarState>>>() {
                        if let Ok(mut guard) = state.lock() {
                            if let Some(s) = guard.take() {
                                // Mata a árvore inteira de processos no Windows
                                #[cfg(target_os = "windows")]
                                {
                                    let _ = std::process::Command::new("taskkill")
                                        .args(["/F", "/T", "/PID", &s.pid.to_string()])
                                        .output();
                                }

                                
                                
                            }
                        }
                    }
                    app.exit(0);
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}