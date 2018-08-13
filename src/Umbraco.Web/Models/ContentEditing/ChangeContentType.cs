using System.Collections.Generic;
using System.Runtime.Serialization;
using Umbraco.Core.Models;

namespace Umbraco.Web.Models.ContentEditing
{
    [DataContract(Name = "changeContentType", Namespace = "")]
    public class ChangeContentType
    {
        [DataMember(Name = "contentNodeId")]
        public int ContentNodeId { get; set; }

        [DataMember(Name = "newContentTypeId")]
        public int NewContentTypeId { get; set; }

        [DataMember(Name = "newTemplateId")]
        public int NewTemplateId { get; set; }

        [DataMember(Name = "fieldMap")]
        public IEnumerable<FieldMap> FieldMap { get; set; }
    }

    [DataContract(Name = "fieldMap", Namespace = "")]
    public class FieldMap
    {
        [DataMember(Name = "fromAlias")]
        public string FromAlias { get; set; }

        [DataMember(Name = "toAlias")]
        public string ToAlias { get; set; }
    }

    public class FieldMapValue
    {
        public string ToAlias { get; set; }

        public object CurrentValue { get; set; }
    }

    [DataContract(Name = "availableContentTypes", Namespace = "")]
    public class AvailableContentTypes
    {
        [DataMember(Name = "currentNodeName")]
        public string CurrentNodeName { get; set; }

        [DataMember(Name = "currentContentType")]
        public IContentType CurrentContentType { get; set; }

        [DataMember(Name = "contentTypes")]
        public IEnumerable<IContentType> ContentTypes { get; set; }
    }

    [DataContract(Name = "availableProperties", Namespace = "")]
    public class AvailableProperties
    {
        [DataMember(Name = "templates")]
        public IEnumerable<ITemplate> Templates { get; set; }

        [DataMember(Name = "currentProperties")]
        public IEnumerable<CurrentProperty> CurrentProperties { get; set; }
    }

    [DataContract(Name = "currentProperty", Namespace = "")]
    public class CurrentProperty
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "alias")]
        public string Alias { get; set; }

        [DataMember(Name = "allowed")]
        public IEnumerable<NewProperty> Allowed { get; set; }
    }

    public class NewProperty
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "alias")]
        public string Alias { get; set; }
    }
}
