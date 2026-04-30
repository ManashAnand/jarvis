use std::sync::{Arc, Mutex};
use std::sync::{ mpsc::Sender};
pub struct RecorderState {
    pub stop_tx: Option<Sender<()>>,
    pub file_path: Option<String>,
}

#[tauri::command]
pub fn start_recording(state: tauri::State<Mutex<RecorderState>>) {
    let (tx, rx) = std::sync::mpsc::channel();

    let mut path = std::env::current_dir().unwrap();
    path.pop();
    path.push("input_audio");
    std::fs::create_dir_all(&path).unwrap();
    path.push("audio.wav");

    let path_str = path.to_str().unwrap().to_string();

    // spawn recording thread
    std::thread::spawn({
        let path_str = path_str.clone();

        move || {
            use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

            let host = cpal::default_host();
            let device = host.default_input_device().unwrap();
            let config = device.default_input_config().unwrap();

            let sample_format = config.sample_format();
            let config: cpal::StreamConfig = config.into();

            let writer = Arc::new(Mutex::new(
                hound::WavWriter::create(
                    &path_str,
                    hound::WavSpec {
                        channels: 1,
                        sample_rate: 44100,
                        bits_per_sample: 16,
                        sample_format: hound::SampleFormat::Int,
                    },
                )
                .unwrap(),
            ));

            let writer_clone = writer.clone();

            let stream = match sample_format {
                cpal::SampleFormat::F32 => device.build_input_stream(
                    &config,
                    move |data: &[f32], _| {
                        let mut writer = writer_clone.lock().unwrap();
                        for &sample in data {
                            let val = (sample * i16::MAX as f32) as i16;
                            writer.write_sample(val).unwrap();
                        }
                    },
                    |_| {},
                    None,
                ),
                _ => panic!("Unsupported format"),
            }
            .unwrap();

            stream.play().unwrap();

            // wait for stop signal
            rx.recv().unwrap();

            drop(stream);

            let writer = match Arc::try_unwrap(writer) {
                Ok(w) => w.into_inner().unwrap(),
                Err(_) => panic!("Writer still in use"),
            };

            writer.finalize().unwrap();

            println!("✅ Recording saved");
        }
    });

    let mut state = state.lock().unwrap();
    state.stop_tx = Some(tx);
    state.file_path = Some(path_str);

    println!("🎤 Recording started");
}

#[tauri::command]
pub fn stop_recording(state: tauri::State<Mutex<RecorderState>>) -> String {
    let mut state = state.lock().unwrap();

    if let Some(tx) = state.stop_tx.take() {
        tx.send(()).unwrap();
    }

    let path = state.file_path.take().unwrap();

    println!("🛑 Recording stopped");

    path
}