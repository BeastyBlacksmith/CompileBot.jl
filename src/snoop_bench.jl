# Snooping functions
function _snoopi_bench_cmd(snoop_script)
    tmin = 0.0 # For benchmarking
    return quote
        global SnoopCompile_ENV = true
        using SnoopCompileCore

        data = @snoopi tmin=$tmin begin
            $snoop_script
        end

        global SnoopCompile_ENV = false

        using SnoopCompileBot: timesum
        @info( "\nTotal inference time (ms): \t" * string(timesum(data, :ms)))
    end
end

function _snoopv_bench_cmd(snoop_script, package_name)
    return quote
        using $package_name
        @info("Script execution time:")
        @timev begin
            $snoop_script
        end
    end
end

function _snoop_bench(config::BotConfig, snoop_script::Expr, test_modul::Module = Main; snoop_mode::Symbol)

    package_name = config.package_name
    package_path = config.package_path

    # automatic (based on Julia version)
    if snoop_mode == :auto
        if VERSION < v"1.2"
            snoop_mode = :run_time
        else
            snoop_mode = :snoopi
        end
    end

    if snoop_mode == :snoopi
        snooping_code = _snoopi_bench_cmd(snoop_script)
    elseif snoop_mode == :run_time
        snooping_code = _snoopv_bench_cmd(snoop_script, package_name)
    else
        error("snoop_mode $snoop_mode is unkown")
    end
    snooping_code = toplevel_string(snooping_code)

    ################################################################
    if isdefined(Main, :SnoopCompile_coverage_ENV) && in(SnoopCompile_coverage_ENV, [true, "true"])
        code_coverage = "user"
    else
        code_coverage = "none"
    end

    julia_cmd = `julia --code-coverage=$code_coverage --project=@. -e $snooping_code`

    addpkg_ifnotfound(:SnoopCompileCore, test_modul)
    devpkg_ifnotfound(:SnoopCopmileBot, "$(dirname(@__DIR__))", test_modul)
    out = quote
        package_sym = Symbol($package_name)
        ################################################################
        using SnoopCompileBot

        @info("""------------------------
        Benchmark Started
        ------------------------
        """)
        ################################################################
        @info("""------------------------
        Precompile Deactivated Benchmark
        ------------------------
        """)
        SnoopCompileBot.precompile_deactivator($package_path);
        ### Log the compiles
        run($julia_cmd)
        ################################################################
        @info("""------------------------
        Precompile Activated Benchmark
        ------------------------
        """)
        SnoopCompileBot.precompile_activator($package_path);
        ### Log the compiles
        run($julia_cmd)
        @info("""------------------------
        Benchmark Finished
        ------------------------
        """)
    end
    return out
end

function _snoop_bench(config::BotConfig, test_modul::Module = Main; snoop_mode::Symbol)

    package_name = config.package_name
    package_rootpath = dirname(dirname(config.package_path))

    package = Symbol(package_name)
    runtestpath = "$package_rootpath/test/runtests.jl"

    snoop_script = quote
        using $(package);
        include($runtestpath);
    end
    out = _snoop_bench(config, snoop_script, test_modul; snoop_mode = snoop_mode)
    return out
end

################################################################
"""
    snoop_bench(config::BotConfig, path_to_example_script::String, test_modul::Module=Main; snoop_mode=:auto)

Benchmark the impact of precompile statements, by running a script with and without the precompiles.
`config` can be generated by [`BotConfig`](@ref).
`path_to_example_script` is preferred to be an absolute path.
The example script will be run in the module specified by `test_modul`.
`snoop_mode` can be `:auto`, `:snoopi` (to test with [`SnoopCompileCore.@snoopi`](@ref)),
or `:runtime` (to measure total script run time with `@timev`).
`:auto` chooses `:snoopi` on supported versions of Julia.

See the [online documentation](https://timholy.github.io/SnoopCompile.jl/stable/bot/)
for a more complete overview.

# Extended help

## Example

In this case, the benchmarking script is placed in the same directory as the
precompile script, so we can use `@__DIR__` to find it:

```julia
using SnoopCompile

snoop_bench(BotConfig("MatLang"), "\$(@__DIR__)/example_script.jl")
```

As an alternative to `@__DIR__` (for example, if you store your benchmarking script(s) outside
the package itself), you can find the package with [`pathof_noload`](@ref).
"""
function snoop_bench(config::BotConfig, path_to_example_script::String, test_modul::Module=Main; snoop_mode::Symbol=:auto)
    # search for the script! - needed because of confusing paths when referencing pattern_or_file in CI
    path_to_example_script = searchdirsboth([pwd(),dirname(dirname(config.package_path))], path_to_example_script)
    snoop_script = quote
        include($path_to_example_script)
    end
    out = _snoop_bench(config, snoop_script, test_modul; snoop_mode = snoop_mode)
    Core.eval( test_modul, out )
end

"""
    snoop_bench(config::BotConfig, test_modul::Module = Main)

Benchmark your precompile files using the package's `runtests.jl` file.

During snooping, `snoop_bench` sets the global variable `SnoopCompile_ENV` to `true`.
If needed, your `runtests.jl` can check for the existence and value of this variable to
customize test behavior specifically for snooping.
```
"""
function snoop_bench(config::BotConfig, test_modul::Module = Main; snoop_mode::Symbol = :auto)
    out = _snoop_bench(config, test_modul; snoop_mode = snoop_mode)
    Core.eval( test_modul, out )
end

"""
    snoop_bench(config::BotConfig, expression::Expr, test_modul::Module = Main)

Benchmark your precompile files by evaluating an expression, for example `:(using MyPackage)`.
Interpolation and macros are not supported.
"""
function snoop_bench(config::BotConfig, snoop_script::Expr, test_modul::Module  = Main; snoop_mode::Symbol = :auto)
    out = _snoop_bench(config, snoop_script, test_modul; snoop_mode = snoop_mode)
    Core.eval( test_modul, out )
end
