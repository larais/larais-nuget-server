module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            build: {
                tsconfig: "tsconfig.json",
                "outDir": "dist",
                src: ["**/*.ts", "!node_modules/**"]
            }
        },
        exec: {
            package_dev: {
                command: "tfx extension create --manifests vss-extension.json",
                stdout: true,
                stderr: true
            },
            publish_dev: {
                command: "tfx extension publish --service-url https://marketplace.visualstudio.com --manifests vss-extension.json",
                stdout: true,
                stderr: true
            }
        },

        clean: ["scripts/**/*.js", "*.vsix", "build", "test"],

    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask("build", ["ts:build"]);
    grunt.registerTask("package-dev", ["build", "exec:package_dev"]);
    grunt.registerTask("publish-dev", ["package-dev", "exec:publish_dev"]);
    grunt.registerTask("default", ["package-dev"]);
};