var documenterSearchIndex = {"docs":
[{"location":"reference/#Reference-1","page":"Syntax Reference","title":"Reference","text":"","category":"section"},{"location":"reference/#Snoop-bot-1","page":"Syntax Reference","title":"Snoop bot","text":"","category":"section"},{"location":"reference/#","page":"Syntax Reference","title":"Syntax Reference","text":"BotConfig\nsnoop_bot\nsnoop_bench","category":"page"},{"location":"reference/#CompileBot.BotConfig","page":"Syntax Reference","title":"CompileBot.BotConfig","text":"BotConfig(package_name::AbstractString ; exclusions, os, else_os, version, else_version, package_path, precompiles_rootpath, subst, tmin)\n\nConstruct a SnoopCompile bot configuration. package_name is the name of the package. This object is passed to snoop_bot and snoop_bench.\n\nYou may supply the following optional keyword arguments:\n\nexclusions : A vector of of Strings (or RegExp) to exclude some functions from being precompiled\nos: A vector of of Strings (or RegExp) to support with precompile statements.\n\nExample: os = [\"windows\", \"linux\"]\n\nelse_os: If you want to use a specific operating system's precompile file as the default, set else_os to the name of that os. Not passing this argument skips precompilation on any operating system other than those explicitly listed in os.\n\nExample: else_os = \"linux\"\n\nversion: A vector of of Julia versions used to generate precompile signatures.\n\nExample: version = [v\"1.1\",v\"1.5.0\", \"nightly\"]\n\nIt is assumed that the generated precompile signatures are valid for patch versions of Julia (e.g. givingv\"1.5.0\" supports v\"1.4.0\" to v\"1.4.999\").\n\nelse_version: the Julia version used to generate the default signatures for other versions.\n\nNot passing this argument skips precompilation on any Julia version other than those explicitly listed in version.\n\nExample: else_version =v\"1.5.0\"\n\nyml_path: instead of directly passing os and version to BotConfig, you can pass yml_path which should be the GitHub actions YAML path or file name.\n\nIt assumes that the job name is SnoopCompile.\n\nExample: yaml_path = \"SnoopCompile.yml\"\n\npackage_path: path to the main .jl file of the package (similar to pathof). Default path is pathof_noload(package_name).\nprecompiles_rootpath: the path where precompile files are stored. Default path is \"dirname(dirname(package_path))/deps/SnoopCompile/precompile\".\nsubst : A vector of pairs of Strings (or RegExp) to replace a packages precompile statements with another's package like [\"ImageTest\" => \"Images\"].\ntmin: Methods that take less time than tmin to be inferred will not be added to the precompile statements. Defaults to 0.01. Set it to 0.0 if you want to include all the sentences.\ncheck_eval: By default, the bot discards the precompile statements that cannot be evaled.\n\nIn rare cases (when snooping is very time consuming), you may want to do this manually by using the printed errors to add the problematic functions to exclusions and then set check_eval=false for the future runs.\n\nExample\n\nbotconfig1 = BotConfig(\n  \"Zygote\";                            # package name (the one this configuration lives in)\n  os = [\"linux\", \"windows\", \"macos\"],  # operating systems for which to precompile\n  version = [v\"1.5.0\", v\"1.3.1\"],      # supported Julia versions\n  exclusions = [\"SqEuclidean\"],         # exclude functions (by name) that would be problematic if precompiled\n)\n\nbotconfig2 = BotConfig(\n  \"Zygote\";                            # package name (the one this configuration lives in)\n  yml_path = \"SnoopCompile.yml\"        # parse `os` and `version` from `SnoopCompile.yml`\n  exclusions = [\"SqEuclidean\"],         # exclude functions (by name) that would be problematic if precompiled\n)\n\n# A full example:\nBotConfig(\"MatLang\", exclusions = [\"badfunction\"], os = [\"linux\", \"windows\", \"macos\"], else_os = \"linux\", version = [\"1.5.0\", \"1.2\", \"1.0.5\"], else_version = \"1.5.0\" )\n\n# Different examples for other possibilities:\nBotConfig(\"MatLang\")\n\nBotConfig(\"MatLang\", exclusions = [\"badfunction\"])\n\nBotConfig(\"MatLang\", os = [\"linux\", \"windows\"])\n\nBotConfig(\"MatLang\", os = [\"windows\", \"linux\"], else_os = \"linux\")\n\nBotConfig(\"MatLang\", version = [v\"1.1\",v\"1.5.0\"])\n\nBotConfig(\"MatLang\", version = [v\"1.1\",v\"1.5.0\"], else_version =v\"1.5.0\")\n\nBotConfig(\"MatLang\", os = [\"linux\", \"windows\"], version = [v\"1.1\",v\"1.5.0\"])\n\n\n\n\n\n","category":"type"},{"location":"reference/#CompileBot.snoop_bot","page":"Syntax Reference","title":"CompileBot.snoop_bot","text":"snoop_bot(config::BotConfig, path_to_example_script::String, test_modul=Main; snoop_mode=:auto)\n\nGenerate precompile statements using a precompile script. config can be generated by BotConfig. path_to_example_script is preferred to be an absolute path. The example script will be run in the module specified by test_modul. snoop_mode can be :auto, :snoopi (to run SnoopCompileCore.@snoopi), or :snoopc (to run SnoopCompileCore.@snoopc), where :auto chooses :snoopi on supported versions of Julia.\n\nSee the online documentation for a more complete overview.\n\nExtended help\n\nExample\n\nIn this case, the bot-running script is placed in the same directory as the precompile script, so we can use @__DIR__ to find it:\n\nusing CompileBot\n\nsnoop_bot(BotConfig(\"MatLang\"), \"$(@__DIR__)/example_script.jl\")\n\n\n\n\n\nsnoop_bot(config::BotConfig, test_modul::Module = Main; snoop_mode::Symbol = :auto)\n\nGenerate precompile statements using the package's runtests.jl file.\n\nDuring snooping, snoop_bot sets the global variable SnoopCompile_ENV to true. If needed, your runtests.jl can check for the existence and value of this variable to customize test behavior specifically for snooping.\n\n\n\n\n\nsnoop_bot(config::BotConfig, expression::Expr, test_modul::Module = Main; snoop_mode::Symbol = :auto)\n\nGenerate precompile statements by evaluating an expression, for example :(using MyPackage). Interpolation and macros are not supported.\n\n\n\n\n\n","category":"function"},{"location":"reference/#CompileBot.snoop_bench","page":"Syntax Reference","title":"CompileBot.snoop_bench","text":"snoop_bench(config::BotConfig, path_to_example_script::String, test_modul::Module=Main; snoop_mode=:auto)\n\nBenchmark the impact of precompile statements, by running a script with and without the precompiles. config can be generated by BotConfig. path_to_example_script is preferred to be an absolute path. The example script will be run in the module specified by test_modul. snoop_mode can be :auto, :snoopi (to test with SnoopCompileCore.@snoopi), or :runtime (to measure total script run time with @timev). :auto chooses :snoopi on supported versions of Julia.\n\nSee the online documentation for a more complete overview.\n\nExtended help\n\nExample\n\nIn this case, the benchmarking script is placed in the same directory as the precompile script, so we can use @__DIR__ to find it:\n\nusing CompileBot\n\nsnoop_bench(BotConfig(\"MatLang\"), \"$(@__DIR__)/example_script.jl\")\n\nAs an alternative to @__DIR__ (for example, if you store your benchmarking script(s) outside the package itself), you can find the package with pathof_noload.\n\n\n\n\n\nsnoop_bench(config::BotConfig, test_modul::Module = Main; snoop_mode::Symbol = :auto)\n\nBenchmark your precompile files using the package's runtests.jl file.\n\nDuring snooping, snoop_bench sets the global variable SnoopCompile_ENV to true. If needed, your runtests.jl can check for the existence and value of this variable to customize test behavior specifically for snooping. ```\n\n\n\n\n\nsnoop_bench(config::BotConfig, expression::Expr, test_modul::Module = Main; snoop_mode::Symbol = :auto)\n\nBenchmark your precompile files by evaluating an expression, for example :(using MyPackage). Interpolation and macros are not supported.\n\n\n\n\n\n","category":"function"},{"location":"reference/#Snoop-bot-utilities-1","page":"Syntax Reference","title":"Snoop bot utilities","text":"","category":"section"},{"location":"reference/#","page":"Syntax Reference","title":"Syntax Reference","text":"pathof_noload\ntimesum","category":"page"},{"location":"reference/#CompileBot.pathof_noload","page":"Syntax Reference","title":"CompileBot.pathof_noload","text":"Returns a package's path without loading the package in the main Julia process. May launch a separate Julia process to find the package.\n\nExamples\n\npathof_noload(\"MatLang\")\n\n\n\n\n\n","category":"function"},{"location":"reference/#CompileBot.timesum","page":"Syntax Reference","title":"CompileBot.timesum","text":"timesum(snoop::Vector{Tuple{Float64, Core.MethodInstance}}, unit = :s)\n\nCalculates the total time measured by a snoop macro. unit can be :s or :ms.\n\nExamples\n\nusing SnoopCompile\ndata = @snoopi begin\n    using MatLang\n    MatLang_rootpath = dirname(dirname(pathof(\"MatLang\")))\n\n    include(\"$MatLang_rootpath/test/runtests.jl\")\nend\nprintln(timesum(data, :ms))\n\n\n\n\n\n","category":"function"},{"location":"#CompileBot.jl-1","page":"Home","title":"CompileBot.jl","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"CompileBot automatically generates precompilation data for your Julia packages, which results in reducing the time it takes for runtime compilation, loading, and startup.","category":"page"},{"location":"#Installation-1","page":"Home","title":"Installation","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"using Pkg\nPkg.add(\"CompileBot\")","category":"page"},{"location":"#","page":"Home","title":"Home","text":"using CompileBot","category":"page"},{"location":"#Usage-1","page":"Home","title":"Usage","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"As you change the code in your package, the precompile statements likely need to be updated too. You can use SnoopCompile bot to automatically and continuously create precompile files. This bot can be used offline or online.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Follow these steps to set up SnoopCompile bot for your package.","category":"page"},{"location":"#Add-Julia-to-your-system-PATH-(if-you-haven't-done-that-already)-1","page":"Home","title":"1 - Add Julia to your system PATH (if you haven't done that already)","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"The CompileBot spawns a new Julia process when running the snoop_bot function. Therefore, you need to make sure that Julia is added to your system PATH. See the official documentation on how to do that: https://julialang.org/downloads/platform/. To test whether Julia has been added successfully, simply open a terminal and type in julia. If everything has been configured correctly, the Julia REPL should be invoked now.","category":"page"},{"location":"#Setting-up-the-SnoopCompile-bot-configuration-folder-1","page":"Home","title":"2 - Setting up the SnoopCompile bot configuration folder","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Here, we will configure the bot in a directory deps/SnoopCompile/ that should be added to your repository. All configuration files for the SnoopCompile bot should go in this directory. If you choose a different name for this directory, be sure to change the path in the configuration steps below.","category":"page"},{"location":"#Create-the-precompile-script-1","page":"Home","title":"3 - Create the precompile script","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"You will need a precompile script, here called example_script.jl, that \"exercises\" the functionality you'd like to precompile. If you write a dedicated precompile script, place it in the bot configuration folder.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Alternatively, you may use your package's \"runtests.jl\" file. While less precise about which functionality is worthy of precompilation, this can slightly simplify configuration as described below.","category":"page"},{"location":"#Create-the-script-that-runs-snoop_bot-1","page":"Home","title":"4 - Create the script that runs snoop_bot","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"The snoop_bot function generates precompile statements and writes them to a file that will be incorporated into your package. snoop_bot requires a few settings, which can be most easily generated by BotConfig. The script that runs snoop_bot should be saved in your configuration directory, with a name like snoop_bot.jl.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"The example below (from here) supports multiple operating systems, multiple Julia versions, and excludes a function whose precompilation would be problematic:","category":"page"},{"location":"#","page":"Home","title":"Home","text":"using CompileBot\n\nbotconfig = BotConfig(\n  \"Zygote\";                            # package name (the one this configuration lives in)\n  yml_path = \"SnoopCompile.yml\"        # parse `os` and `version` from `SnoopCompile.yml`\n  exclusions = [\"SqEuclidean\"],        # exclude functions (by name) that would be problematic if precompiled\n)\n\nsnoop_bot(\n  botconfig,\n  \"$(@__DIR__)/example_script.jl\",\n)","category":"page"},{"location":"#","page":"Home","title":"Home","text":"If you choose to use your \"runtests.jl\" file as your precompile script, configuration can be as simple as specifying just the name of the package:","category":"page"},{"location":"#","page":"Home","title":"Home","text":"using CompileBot\n\nsnoop_bot(BotConfig(\"MyPackage\"))","category":"page"},{"location":"#","page":"Home","title":"Home","text":"note: Note\nSome of your regular tests may not be appropriate for snoop_bot. snoop_bot sets a global variable SnoopCompile_ENV to true during snooping, and sets it to false when finished. You can exploit this in your tests to determine whether snooping is on:if !isdefined(Main, :SnoopCompile_ENV) || SnoopCompile_ENV == false\n    # Tests that you want to skip when snooping\nend","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Finally, you could use package loading as the only operation, with snoop_bot(config, :(using MyPackage)).","category":"page"},{"location":"#","page":"Home","title":"Home","text":"snoop_bot uses different strategies depending on the Julia version:","category":"page"},{"location":"#","page":"Home","title":"Home","text":"On Julia 1.2 or higher, it identifies methods for precompilation based on @snoopi;\nOn Julia 1.0 or 1.1 (which do not support @snoopi), it identifies methods for precompilation based on @snoopc.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"You can override this default behavior with a keyword argument, see snoop_bot for details.","category":"page"},{"location":"#Optionally-test-the-impact-of-your-precompiles-with-snoop_bench-1","page":"Home","title":"5 - Optionally test the impact of your precompiles with snoop_bench","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Call snoop_bench to measure the effect of adding precompile files. It takes the same parameters as snoop_bot above. You can run this manually, or choose to run it during automatic precompile file generation. To perform it automatically, create a snoop_bench.jl script in the bot configuration directory. This should be nearly identical to your snoop_bot.jl file, but calling snoop_bench instead. Note that benchmarking has the option of different performance metrics, snoop_mode=:snoopi or snoop_mode=:run_time depending on whether you want to measure inference time or the run time of your precompile script.","category":"page"},{"location":"#Configure-the-bot-to-run-with-a-GitHub-Action-file-1","page":"Home","title":"6 - Configure the bot to run with a GitHub Action file","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"You can create the precompile files automatically when you merge pull requests to master by adding a workflow file under .github/workflows/SnoopCompile.yml. This file should have content such as the example below. Lines marked with NOTE deserve special attention as likely places you may need to adjust the configuration.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"name: SnoopCompile\n\non:\n  push:\n    branches:\n    #  - 'master'  # NOTE: uncomment to run the bot only on pushes to master\n\ndefaults:\n  run:\n    shell: bash\n\njobs:\n  SnoopCompile:\n    if: \"!contains(github.event.head_commit.message, '[skip ci]')\"\n    runs-on: ${{ matrix.os }}\n    strategy:\n      fail-fast: false\n\n      matrix:\n        # NOTE: only keep the versions you want to support\n        # NOTE: if not using `yml_path`, these should match the version in `BotConfig`\n        version:\n          - 'nightly'\n          - '1.5.3'\n          - '1.4.2'\n          - '1.3.1'\n          - '1.2.0'\n          - '1.1.1'\n          - '1.0.5'\n        os:        # NOTE: if not using `yml_path`, these should match the os in `BotConfig`\n          - ubuntu-latest\n          - windows-latest\n          - macos-latest\n        arch:\n          - x64\n\n    steps:\n      - uses: actions/checkout@v2\n      - uses: julia-actions/setup-julia@latest\n        with:\n          version: ${{ matrix.version }}\n\n      - name: Install dependencies\n        run: |\n          julia --project -e 'using Pkg; Pkg.instantiate();'\n          julia -e 'using Pkg; Pkg.add( PackageSpec(name=\"CompileBot\", version = \"1\") );\n                    Pkg.develop(PackageSpec(; path=pwd()));\n                    using CompileBot; CompileBot.addtestdep();'\n\n      - name: Generating precompile files\n        run: julia --project -e 'include(\"deps/SnoopCompile/snoop_bot.jl\")'   # NOTE: notice the path\n\n      - name: Running Benchmark\n        run: julia --project -e 'include(\"deps/SnoopCompile/snoop_bench.jl\")' # NOTE: optional, if have benchmark file\n\n      - name: Upload all\n        continue-on-error: true # due to connection issues\n        uses: actions/upload-artifact@v2.0.1\n        with:\n          path: ./\n\n  Create_PR:\n    if: \"!contains(github.event.head_commit.message, '[skip ci]')\"\n    needs: SnoopCompile\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - name: Download all\n        uses: actions/download-artifact@v2\n\n      - name: CompileBot postprocess\n        run: julia -e 'using Pkg; Pkg.add( PackageSpec(name=\"CompileBot\", version = \"1\") );\n                       using CompileBot; CompileBot.postprocess();'\n\n      - name: Create Pull Request\n        uses: peter-evans/create-pull-request@v3\n        with:\n          token: ${{ secrets.GITHUB_TOKEN }}\n          commit-message: Update precompile_*.jl file\n          title: \"[AUTO] Update precompiles\"\n          labels: SnoopCompile\n          branch: \"SnoopCompile_AutoPR_${{ github.ref }}\"\n\n\n  Skip:\n    if: \"contains(github.event.head_commit.message, '[skip ci]')\"\n    runs-on: ubuntu-latest\n    steps:\n      - name: Skip CI 🚫\n        run: echo skip ci","category":"page"},{"location":"#","page":"Home","title":"Home","text":"You can learn more about these files and the workflow process in the documentation. Examples of such files in projects can be found in other packages, for example Zygote.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"note: Note\nUpgrading from an old SnoopCompile bot:CompileBot is now in a separate repository, and the API is changed because of that. Call using CompileBot directly in your snoop scripts and update your workflow based on this guide: Configure the bot to run with a GitHub Action fileIn addition to the previous steps, you should also remove _precompile_() and any other code that includes a _precompile_() function. In the new version, SnoopCompile automatically creates the appropriate code.","category":"page"}]
}
