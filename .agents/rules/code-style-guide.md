---
trigger: always_on
---

* Workspace Code Style Guidelines (Swift/Xcode Compatibility)

* Indentation: Use 4 spaces per indent level. Do not use tabs, as this ensures the code aligns perfectly when opened in Xcode.

* Brace Style: Use Egyptian Braces (opening brace on the same line). Ensure there is exactly one space before the opening brace {.

* Type Annotation: Use no space before a colon and one space after (e.g., var user: String). This matches the Swift standard library style.

* Naming: Use upper camel case for Types/Protocols (e.g., UserAccount) and lower camel case for variables and functions (e.g., calculateTotal).

* Optional Safety: Strictly avoid force-unwrapping (!). Use guard let or if let statements to prevent crashes that lead to App Store rejections.

* Line Breaks: Limit lines to 120 characters. If a function has many parameters, put each parameter on its own line and indent by 4 spaces.

* Documentation: Use triple-slash /// for comments above functions. This allows Xcode to render "Quick Help" documentation for other developers.

* Access Control: Default to private or internal modifiers. Only use public or open when absolutely necessary for the app's architecture.

* Semicolons: Do not use semicolons at the end of lines. Swift is a newline-delimited language, and semicolons are considered "noisy" code.

* Trailing Whitespace: Automatically trim trailing whitespace on save. This keeps the Git diff clean and prevents Xcode "invisible character" warnings.

* Self-Reference: Avoid using self. unless it is required to disambiguate properties from arguments or inside closures to acknowledge capturing.

* File Endings: Ensure every file ends with a single newline character to comply with Unix standards and prevent compiler warnings.