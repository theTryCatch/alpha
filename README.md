<Target Name="SetAspNetCoreEnvironment" AfterTargets="GatherAllFilesToPublish">
    <ItemGroup>
      <_EnvironmentVar Include="&lt;environmentVariable name=&quot;DOTNET_ENVIRONMENT&quot; value=&quot;$(EnvironmentName)&quot; /&gt;" />
    </ItemGroup>

    <XmlPoke
      XmlInputPath="$(PublishDir)web.config"
      Query="/configuration/system.webServer/aspNetCore/environmentVariables"
      Value="@(_EnvironmentVar)"
      Condition="Exists('$(PublishDir)web.config')" />
  </Target>
</Project>
