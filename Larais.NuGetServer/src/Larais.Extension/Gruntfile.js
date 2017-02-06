module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            build: {
                tsconfig: true
            },
            options: {
                fast: 'never'
            }
        },
        exec: {
            package_dev: {
                command: "tfx extension create --rev-version --manifests vss-extension.json",
                stdout: true,
                stderr: true
            },
            //package_release: {
            //    command: "tfx extension create --rev-version --manifests vss-extension.json",
            //    stdout: true,
            //    stderr:true
            //},
            publish_dev: {
                command: "tfx extension publish --service-url https://marketplace.visualstudio.com --manifests vss-extension.json",
                stdout: true,
                stderr: true
            },
        },
        clean: ["dist/", "*.vsix", "build", "test"],
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask("build", ["clean", "ts:build"]);

    grunt.registerTask("package-dev", ["build", "exec:package_dev"]);
    grunt.registerTask("publish-dev", ["package-dev", "exec:publish_dev"]);

    grunt.registerTask("default", ["package-dev"]);
};