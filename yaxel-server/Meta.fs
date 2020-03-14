module Meta

open Microsoft.FSharp.Reflection

type Type =
    | Int
    | Float
    | Bool
    | String
    | Option of Type
    | List of Type
    | Record of RecordType
    | Union of UnionType
    | Unknown of System.Type

and RecordType =
    { RecordName: string
      RecordFields: RecordField list }

and RecordField =
    { FieldName: string
      FieldType: Type }

and UnionType =
    { UnionName: string
      UnionCases: UnionCase list }

and UnionCase =
    { CaseName: string
      CaseType: Type option }


let private primitiveTypes =
    [ typeof<int>, Type.Int
      typeof<float>, Type.Float
      typeof<bool>, Type.Bool
      typeof<string>, Type.String ]
    |> readOnlyDict

let rec toMetaType (t: System.Type) =
    let contains, found = primitiveTypes.TryGetValue t
    if contains then
        found
    elif FSharpType.IsRecord t then
        { RecordName = t.Name
          RecordFields =
              FSharpType.GetRecordFields t
              |> Array.map (fun prop ->
                  { FieldName = prop.Name
                    FieldType = toMetaType prop.PropertyType })
              |> Array.toList }
        |> Record
    elif FSharpType.IsUnion t then
        { UnionName = t.Name
          UnionCases =
              FSharpType.GetUnionCases t
              |> Array.map (fun case ->
                  { CaseName = case.Name
                    CaseType = None })
              |> Array.toList }
        |> Union
    else
        Unknown t
