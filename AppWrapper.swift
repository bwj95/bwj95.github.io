import SwiftUI
import WebKit

/// The main entry point for the cross-platform iOS application wrap.
@main
struct BusinessAppApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

/// The primary content view that holds our web application and a native loading indicator.
struct ContentView: View {
    @State private var isLoading: Bool = true

    var body: some View {
        ZStack {
            // Background matches the dark theme color from CSS
            Color(red: 11 / 255.0, green: 15 / 255.0, blue: 25 / 255.0)
                .ignoresSafeArea()

            WebViewWrapper(isLoading: $isLoading)
                .ignoresSafeArea()

            if isLoading {
                ProgressView("Loading App...")
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .padding()
                    .background(Color.black.opacity(0.7))
                    .cornerRadius(10)
                    .foregroundColor(.white)
            }
        }
    }
}

/// A SwiftUI representation of WKWebView that loads local HTML resources.
struct WebViewWrapper: UIViewRepresentable {
    @Binding var isLoading: Bool

    func makeUIView(context: Context) -> WKWebView {
        let configuration: WKWebViewConfiguration = WKWebViewConfiguration()
        let webView: WKWebView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator

        // Load offline bundled HTML file
        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
            let directoryUrl = url.deletingLastPathComponent()
            webView.loadFileURL(url, allowingReadAccessTo: directoryUrl)
        }
        
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // No updates required on view refresh
    }

    func makeCoordinator() -> Coordinator {
        return Coordinator(parent: self)
    }

    /// Coordinator to handle WKNavigationDelegate callbacks to update our native loading indicator.
    class Coordinator: NSObject, WKNavigationDelegate {
        private let parent: WebViewWrapper

        init(parent: WebViewWrapper) {
            self.parent = parent
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.isLoading = true
            }
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
            }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.async {
                self.parent.isLoading = false
            }
        }
    }
}
